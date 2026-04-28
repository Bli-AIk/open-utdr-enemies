use crate::expr::Expr;
use crate::ir::{DrawOp, RenderProgram, SpriteDraw, UpdateOp};
use std::fmt::Write;

pub fn generate(program: &RenderProgram) -> String {
    let mut output = String::new();

    writeln!(output, "/// {} UTRP GameMaker starter", program.name).unwrap();
    writeln!(output, "/// Source slug: {}", program.slug).unwrap();
    writeln!(
        output,
        "/// Canvas: {}x{} at {}x draw scale",
        program.canvas.width,
        program.canvas.height,
        format_float(program.canvas.scale)
    )
    .unwrap();
    writeln!(output, "/// Asset map:").unwrap();
    for asset in &program.assets {
        writeln!(
            output,
            "/// - {} => {} (placeholder sprite: {})",
            asset.id,
            asset.path,
            sprite_resource_name(&asset.id)
        )
        .unwrap();
        for frame in &asset.frames {
            if frame != &asset.path {
                writeln!(output, "///   frame: {frame}").unwrap();
            }
        }
    }

    writeln!(output).unwrap();
    writeln!(output, "/// {} Create Event", program.name).unwrap();
    if program.variables.is_empty() {
        writeln!(output, "// No UTRP variables are defined for this program.").unwrap();
    }
    for variable in &program.variables {
        writeln!(
            output,
            "{} = {};",
            gml_identifier(&variable.name),
            format_float(variable.initial)
        )
        .unwrap();
    }

    writeln!(output).unwrap();
    writeln!(output, "/// {} Step Event", program.name).unwrap();
    if program.update.is_empty() {
        writeln!(
            output,
            "// No UTRP update operations are defined for this program."
        )
        .unwrap();
    }
    for op in &program.update {
        match op {
            UpdateOp::Increment { variable, by } => {
                writeln!(output, "{} += {};", gml_identifier(variable), by.to_gml()).unwrap();
            }
        }
    }

    writeln!(output).unwrap();
    writeln!(output, "/// {} Draw Event", program.name).unwrap();
    writeln!(
        output,
        "var __utrp_scale = {};",
        format_float(program.canvas.scale)
    )
    .unwrap();

    for draw in sprite_draws(program) {
        write_sprite_draw(&mut output, draw);
    }

    output
}

fn write_sprite_draw(output: &mut String, draw: &SpriteDraw) {
    let transform = &draw.transform;
    let x = position_expr(draw.origin.x, transform.offset_x.as_ref());
    let y = position_expr(draw.origin.y, transform.offset_y.as_ref());
    let xscale = scale_expr(transform.scale_x.as_ref());
    let yscale = scale_expr(transform.scale_y.as_ref());
    let rotation = expr_or_default(transform.rotation_deg.as_ref(), 0.0);
    let alpha = expr_or_default(transform.alpha.as_ref(), 1.0);
    let frame = expr_or_default(transform.frame_index.as_ref(), 0.0);

    writeln!(output, "// draw_order {}: {}", draw.draw_order, draw.id).unwrap();
    writeln!(
        output,
        "draw_sprite_ext({}, {}, {}, {}, {}, {}, {}, c_white, {});",
        sprite_resource_name(&draw.sprite),
        frame,
        x,
        y,
        xscale,
        yscale,
        rotation,
        alpha
    )
    .unwrap();
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

fn position_expr(origin: f64, offset: Option<&Expr>) -> String {
    match offset {
        Some(offset) => format!("{} + ({})", format_float(origin), offset.to_gml()),
        None => format_float(origin),
    }
}

fn scale_expr(scale: Option<&Expr>) -> String {
    match scale {
        Some(scale) => format!("__utrp_scale * ({})", scale.to_gml()),
        None => "__utrp_scale".to_string(),
    }
}

fn expr_or_default(expr: Option<&Expr>, default: f64) -> String {
    expr.map_or_else(|| format_float(default), Expr::to_gml)
}

fn sprite_resource_name(asset_id: &str) -> String {
    format!("spr_{}", gml_identifier(asset_id))
}

fn gml_identifier(value: &str) -> String {
    let mut ident = String::new();
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() || ch == '_' {
            ident.push(ch);
        } else {
            ident.push('_');
        }
    }
    if ident
        .chars()
        .next()
        .is_none_or(|ch| !ch.is_ascii_alphabetic() && ch != '_')
    {
        ident.insert(0, '_');
    }
    ident
}

fn format_float(value: f64) -> String {
    if value.fract() == 0.0 {
        format!("{value:.1}")
    } else {
        value.to_string()
    }
}
