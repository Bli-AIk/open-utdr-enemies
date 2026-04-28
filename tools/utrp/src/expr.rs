use anyhow::{Context, bail};
use serde::{Deserialize, Deserializer, Serialize, Serializer};

#[derive(Clone, Debug, PartialEq)]
pub enum Expr {
    Number(f64),
    Variable(String),
    Unary {
        op: String,
        value: Box<Expr>,
    },
    Binary {
        op: String,
        left: Box<Expr>,
        right: Box<Expr>,
    },
    Call {
        name: String,
        args: Vec<Expr>,
    },
}

impl Expr {
    pub fn number(value: f64) -> Self {
        Self::Number(value)
    }

    pub fn parse(source: &str) -> anyhow::Result<Self> {
        Parser::new(source).parse()
    }

    pub fn to_gml(&self) -> String {
        self.render(Target::Gml, 0)
    }

    pub fn to_js(&self) -> String {
        self.render(Target::Js, 0)
    }

    fn render(&self, target: Target, parent_precedence: u8) -> String {
        let precedence = self.precedence();
        let rendered = match self {
            Self::Number(value) => format_number(*value),
            Self::Variable(name) => match target {
                Target::Gml => name.clone(),
                Target::Js => format!("vars.{name}"),
            },
            Self::Unary { op, value } => format!("{op}{}", value.render(target, precedence)),
            Self::Binary { op, left, right } => {
                let right_parent = if matches!(op.as_str(), "-" | "/" | "%") {
                    precedence + 1
                } else {
                    precedence
                };
                format!(
                    "{} {op} {}",
                    left.render(target, precedence),
                    right.render(target, right_parent)
                )
            }
            Self::Call { name, args } => {
                let function = match target {
                    Target::Gml => name.clone(),
                    Target::Js => js_function_name(name),
                };
                let args = args
                    .iter()
                    .map(|arg| arg.render(target, 0))
                    .collect::<Vec<_>>()
                    .join(", ");
                format!("{function}({args})")
            }
        };

        if precedence < parent_precedence {
            format!("({rendered})")
        } else {
            rendered
        }
    }

    fn precedence(&self) -> u8 {
        match self {
            Self::Binary { op, .. } if matches!(op.as_str(), "+" | "-") => 1,
            Self::Binary { op, .. } if matches!(op.as_str(), "*" | "/" | "%") => 2,
            Self::Unary { .. } => 3,
            _ => 4,
        }
    }
}

impl Serialize for Expr {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_gml())
    }
}

impl<'de> Deserialize<'de> for Expr {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let source = String::deserialize(deserializer)?;
        Self::parse(&source).map_err(serde::de::Error::custom)
    }
}

#[derive(Clone, Copy)]
enum Target {
    Gml,
    Js,
}

fn js_function_name(name: &str) -> String {
    match name {
        "sin" | "cos" | "floor" | "ceil" | "round" | "abs" | "sign" | "min" | "max" | "pow"
        | "sqrt" => format!("Math.{name}"),
        "clamp" => "clamp".into(),
        _ => name.into(),
    }
}

fn format_number(value: f64) -> String {
    if value.fract() == 0.0 {
        format!("{value:.1}")
    } else {
        value.to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
enum Token {
    Number(f64),
    Ident(String),
    Op(char),
    LParen,
    RParen,
    Comma,
    Eof,
}

struct Lexer<'a> {
    source: &'a str,
    chars: std::str::CharIndices<'a>,
    current: Option<(usize, char)>,
}

impl<'a> Lexer<'a> {
    fn new(source: &'a str) -> Self {
        let mut chars = source.char_indices();
        let current = chars.next();
        Self {
            source,
            chars,
            current,
        }
    }

    fn next_token(&mut self) -> anyhow::Result<Token> {
        while matches!(self.current, Some((_, c)) if c.is_whitespace()) {
            self.advance();
        }

        let Some((start, ch)) = self.current else {
            return Ok(Token::Eof);
        };

        match ch {
            '0'..='9' | '.' => self.number(start),
            'a'..='z' | 'A'..='Z' | '_' => Ok(self.ident(start)),
            '+' | '-' | '*' | '/' | '%' => {
                self.advance();
                Ok(Token::Op(ch))
            }
            '(' => {
                self.advance();
                Ok(Token::LParen)
            }
            ')' => {
                self.advance();
                Ok(Token::RParen)
            }
            ',' => {
                self.advance();
                Ok(Token::Comma)
            }
            _ => bail!("unexpected character `{ch}`"),
        }
    }

    fn number(&mut self, start: usize) -> anyhow::Result<Token> {
        let mut end = start;
        let mut seen_dot = false;

        while let Some((idx, ch)) = self.current {
            match ch {
                '0'..='9' => {
                    end = idx + ch.len_utf8();
                    self.advance();
                }
                '.' if !seen_dot => {
                    seen_dot = true;
                    end = idx + ch.len_utf8();
                    self.advance();
                }
                _ => break,
            }
        }

        let raw = &self.source[start..end];
        let value = raw
            .parse::<f64>()
            .with_context(|| format!("invalid number `{raw}`"))?;
        Ok(Token::Number(value))
    }

    fn ident(&mut self, start: usize) -> Token {
        let mut end = start;
        while let Some((idx, ch)) = self.current {
            if ch.is_ascii_alphanumeric() || ch == '_' {
                end = idx + ch.len_utf8();
                self.advance();
            } else {
                break;
            }
        }
        Token::Ident(self.source[start..end].into())
    }

    fn advance(&mut self) {
        self.current = self.chars.next();
    }
}

struct Parser<'a> {
    lexer: Lexer<'a>,
    current: Token,
}

impl<'a> Parser<'a> {
    fn new(source: &'a str) -> Self {
        Self {
            lexer: Lexer::new(source),
            current: Token::Eof,
        }
    }

    fn parse(mut self) -> anyhow::Result<Expr> {
        self.advance()?;
        let expr = self.parse_expression(0)?;
        if self.current != Token::Eof {
            bail!("unexpected trailing token {:?}", self.current);
        }
        Ok(expr)
    }

    fn parse_expression(&mut self, min_precedence: u8) -> anyhow::Result<Expr> {
        let mut left = self.parse_prefix()?;

        while let Token::Op(op @ ('+' | '-' | '*' | '/' | '%')) = &self.current {
            let op = *op;
            let precedence = binary_precedence(op);
            if precedence < min_precedence {
                break;
            }
            self.advance()?;
            let right = self.parse_expression(precedence + 1)?;
            left = Expr::Binary {
                op: op.to_string(),
                left: Box::new(left),
                right: Box::new(right),
            };
        }

        Ok(left)
    }

    fn parse_prefix(&mut self) -> anyhow::Result<Expr> {
        match self.current.clone() {
            Token::Number(value) => {
                self.advance()?;
                Ok(Expr::Number(value))
            }
            Token::Ident(name) => {
                self.advance()?;
                if self.current == Token::LParen {
                    self.advance()?;
                    let args = self.parse_args()?;
                    validate_function(&name)?;
                    Ok(Expr::Call { name, args })
                } else {
                    Ok(Expr::Variable(name))
                }
            }
            Token::Op(op @ ('+' | '-')) => {
                self.advance()?;
                Ok(Expr::Unary {
                    op: op.to_string(),
                    value: Box::new(self.parse_expression(3)?),
                })
            }
            Token::LParen => {
                self.advance()?;
                let expr = self.parse_expression(0)?;
                self.expect(Token::RParen)?;
                Ok(expr)
            }
            token => bail!("expected expression, found {token:?}"),
        }
    }

    fn parse_args(&mut self) -> anyhow::Result<Vec<Expr>> {
        if self.current == Token::RParen {
            self.advance()?;
            return Ok(Vec::new());
        }

        let mut args = Vec::new();
        loop {
            args.push(self.parse_expression(0)?);
            match self.current {
                Token::Comma => self.advance()?,
                Token::RParen => {
                    self.advance()?;
                    break;
                }
                _ => bail!("expected `,` or `)` in function call"),
            }
        }
        Ok(args)
    }

    fn expect(&mut self, expected: Token) -> anyhow::Result<()> {
        if self.current == expected {
            self.advance()
        } else {
            bail!("expected {expected:?}, found {:?}", self.current)
        }
    }

    fn advance(&mut self) -> anyhow::Result<()> {
        self.current = self.lexer.next_token()?;
        Ok(())
    }
}

fn binary_precedence(op: char) -> u8 {
    match op {
        '+' | '-' => 1,
        '*' | '/' | '%' => 2,
        _ => 0,
    }
}

fn validate_function(name: &str) -> anyhow::Result<()> {
    match name {
        "sin" | "cos" | "floor" | "ceil" | "round" | "abs" | "sign" | "min" | "max" | "pow"
        | "sqrt" | "clamp" => Ok(()),
        _ => bail!("unsupported function `{name}`"),
    }
}
