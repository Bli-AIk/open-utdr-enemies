use utrp::expr::Expr;
use utrp::ir::*;

#[test]
fn serializes_minimal_render_program() {
    let program = RenderProgram {
        format: "utrp".into(),
        version: 1,
        slug: "smoke".into(),
        name: "Smoke".into(),
        fps: 30,
        canvas: CanvasDef {
            width: 110,
            height: 186,
            scale: 2.0,
        },
        coordinate_space: CoordinateSpace::gms(),
        review: ReviewInfo::needs_source_review("smoke fixture"),
        variables: vec![VariableDef::counter("siner", 1.0)],
        assets: vec![SpriteAsset::single("head", "/sprites/demo/head.png")],
        update: vec![UpdateOp::increment("siner", Expr::number(1.0))],
        draw: vec![DrawOp::Sprite(SpriteDraw {
            id: "head".into(),
            sprite: "head".into(),
            origin: Vec2::new(0.0, -10.0),
            pivot: None,
            transform: TransformExpr {
                rotation_deg: Some(Expr::parse("sin(siner / 7.5) * -3").unwrap()),
                ..Default::default()
            },
            draw_order: 0,
        })],
        codegen: Default::default(),
    };

    let json = serde_json::to_string_pretty(&program).unwrap();
    assert!(json.contains(r#""format": "utrp""#));
    assert!(json.contains(r#""accuracy": "needs_source_review""#));
    assert!(json.contains(r#""origin": "top_left""#));
    assert!(json.contains(r#""rotation": "counter_clockwise""#));
    assert!(json.contains(r#""id": "head""#));
}
