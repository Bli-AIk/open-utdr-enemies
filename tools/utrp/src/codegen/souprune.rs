use crate::expr::Expr;
use crate::ir::{DrawOp, RenderProgram, SpriteAsset, SpriteDraw};
use std::fmt::Write;

pub fn generate(program: &RenderProgram) -> String {
    let mut output = String::new();

    writeln!(output, "use anyhow::Result;").unwrap();
    writeln!(output, "use souprune_schema::view::*;").unwrap();
    writeln!(output, "use souprune_vessel::prelude::*;").unwrap();
    writeln!(output).unwrap();
    writeln!(
        output,
        "// UTRP SoupRune starter for {} ({})",
        program.name, program.slug
    )
    .unwrap();
    writeln!(
        output,
        "// TODO: confirm runtime expression variable bindings before marking source-exact."
    )
    .unwrap();
    writeln!(output, "pub fn emit(reg: &mut Registry) -> Result<()> {{").unwrap();
    writeln!(output, "    reg.emit_auto(file!(), &asset())").unwrap();
    writeln!(output, "}}").unwrap();
    writeln!(output).unwrap();
    writeln!(output, "pub fn asset() -> ViewLayoutAsset {{").unwrap();
    writeln!(output, "    ViewLayoutAsset {{").unwrap();
    writeln!(output, "        roots: vec![").unwrap();

    for draw in sprite_draws(program) {
        write_node(&mut output, program, draw);
    }

    writeln!(output, "        ],").unwrap();
    writeln!(output, "        requires: Vec::new(),").unwrap();
    writeln!(output, "        facts: None,").unwrap();
    writeln!(output, "        world_space: false,").unwrap();
    writeln!(
        output,
        "        coordinate_system: CoordinateSystem::YDown,"
    )
    .unwrap();
    writeln!(
        output,
        "        coordinate_space: Some(CoordinateSpaceDef {{"
    )
    .unwrap();
    writeln!(
        output,
        "            axis_origin: vector2(static_float(0.0), static_float(0.0)),"
    )
    .unwrap();
    writeln!(output, "            y_axis: YAxisDirectionDef::Down,").unwrap();
    writeln!(
        output,
        "            rotation: RotationDirectionDef::CounterClockwise,"
    )
    .unwrap();
    writeln!(
        output,
        "            extent: CoordinateExtentDef::Explicit(({}, {})),",
        format_float(program.canvas.width.into()),
        format_float(program.canvas.height.into())
    )
    .unwrap();
    writeln!(output, "        }}),").unwrap();
    writeln!(output, "    }}").unwrap();
    writeln!(output, "}}").unwrap();

    output
}

fn write_node(output: &mut String, program: &RenderProgram, draw: &SpriteDraw) {
    if draw.transform.frame_index.is_some() {
        writeln!(
            output,
            "            // TODO: UTRP frame_index `{}` is not fully modeled by this basic ViewNodeDef starter.",
            draw.transform
                .frame_index
                .as_ref()
                .map(Expr::to_gml)
                .unwrap_or_default()
        )
        .unwrap();
    }

    let asset = asset_for_draw(program, draw);
    let visual = asset.map_or(draw.sprite.as_str(), |asset| asset.path.as_str());
    let color = draw.transform.alpha.as_ref().map(|alpha| {
        format!(
            "Some(color(static_float(1.0), static_float(1.0), static_float(1.0), {}))",
            val_for_expr(alpha)
        )
    });
    let pivot = draw.pivot.as_ref().map(|pivot| {
        format!(
            "Some(vector2(static_float({}), static_float({})))",
            format_float(pivot.x),
            format_float(pivot.y)
        )
    });

    writeln!(output, "            ViewNodeDef {{").unwrap();
    writeln!(
        output,
        "                name: {}.into(),",
        rust_string(&node_name(program, draw))
    )
    .unwrap();
    writeln!(
        output,
        "                tags: vec![\"utrp\".into(), {}.into()],",
        rust_string(&program.slug)
    )
    .unwrap();
    writeln!(
        output,
        "                transform: Some(SerializableTransform {{"
    )
    .unwrap();
    writeln!(
        output,
        "                    translation: Some(vector3({}, {}, static_float({}))),",
        translation_channel(draw.origin.x, draw.transform.offset_x.as_ref()),
        translation_channel(draw.origin.y, draw.transform.offset_y.as_ref()),
        format_float(draw.draw_order.into())
    )
    .unwrap();
    writeln!(
        output,
        "                    rotation: {},",
        option_val(draw.transform.rotation_deg.as_ref())
    )
    .unwrap();
    writeln!(
        output,
        "                    scale: {},",
        scale_vector(program.canvas.scale, draw)
    )
    .unwrap();
    writeln!(output, "                }}),").unwrap();
    writeln!(output, "                sprite: Some(SpriteDef {{").unwrap();
    writeln!(
        output,
        "                    visual: Visual({}.into()),",
        rust_string(visual)
    )
    .unwrap();
    writeln!(
        output,
        "                    color: {},",
        color.unwrap_or_else(|| "None".to_string())
    )
    .unwrap();
    writeln!(
        output,
        "                    pivot: {},",
        pivot.unwrap_or_else(|| "None".to_string())
    )
    .unwrap();
    writeln!(output, "                    ..Default::default()").unwrap();
    writeln!(output, "                }}),").unwrap();
    writeln!(output, "                ..Default::default()").unwrap();
    writeln!(output, "            }},").unwrap();
}

fn sprite_draws(program: &RenderProgram) -> Vec<&SpriteDraw> {
    let mut draws = program
        .draw
        .iter()
        .map(|op| match op {
            DrawOp::Sprite(draw) => draw,
        })
        .collect::<Vec<_>>();
    draws.sort_by_key(|draw| draw.draw_order);
    draws
}

fn asset_for_draw<'a>(program: &'a RenderProgram, draw: &SpriteDraw) -> Option<&'a SpriteAsset> {
    program.assets.iter().find(|asset| asset.id == draw.sprite)
}

fn translation_channel(origin: f64, offset: Option<&Expr>) -> String {
    match offset {
        Some(Expr::Number(value)) => format!("static_float({})", format_float(origin + value)),
        Some(offset) => format!(
            "expression({})",
            rust_string(&format!("{} + ({})", format_float(origin), offset.to_gml()))
        ),
        None => format!("static_float({})", format_float(origin)),
    }
}

fn scale_vector(base_scale: f64, draw: &SpriteDraw) -> String {
    if base_scale == 1.0 && draw.transform.scale_x.is_none() && draw.transform.scale_y.is_none() {
        return "None".to_string();
    }

    format!(
        "Some(vector3({}, {}, static_float(1.0)))",
        scale_channel(base_scale, draw.transform.scale_x.as_ref()),
        scale_channel(base_scale, draw.transform.scale_y.as_ref())
    )
}

fn scale_channel(base_scale: f64, scale: Option<&Expr>) -> String {
    match scale {
        Some(Expr::Number(value)) => format!("static_float({})", format_float(base_scale * value)),
        Some(scale) => format!(
            "expression({})",
            rust_string(&format!(
                "{} * ({})",
                format_float(base_scale),
                scale.to_gml()
            ))
        ),
        None => format!("static_float({})", format_float(base_scale)),
    }
}

fn option_val(expr: Option<&Expr>) -> String {
    expr.map_or_else(
        || "None".to_string(),
        |expr| format!("Some({})", val_for_expr(expr)),
    )
}

fn val_for_expr(expr: &Expr) -> String {
    match expr {
        Expr::Number(value) => format!("static_float({})", format_float(*value)),
        _ => format!("expression({})", rust_string(&expr.to_gml())),
    }
}

fn node_name(program: &RenderProgram, draw: &SpriteDraw) -> String {
    format!(
        "{}_{}",
        identifier_fragment(program.slug.rsplit('/').next().unwrap_or(&program.slug)),
        identifier_fragment(&draw.id)
    )
}

fn identifier_fragment(value: &str) -> String {
    let mut ident = String::new();
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() || ch == '_' {
            ident.push(ch);
        } else {
            ident.push('_');
        }
    }
    ident
}

fn rust_string(value: &str) -> String {
    format!("{value:?}")
}

fn format_float(value: f64) -> String {
    if value.fract() == 0.0 {
        format!("{value:.1}")
    } else {
        value.to_string()
    }
}
