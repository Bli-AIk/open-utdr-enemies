use utrp::expr::Expr;
use utrp::ir::*;

const EXPECTED_SOURCE_SLUGS: &[&str] = &[
    "core/astigmatism",
    "core/finalfroggit",
    "core/knight-knight",
    "core/madjick",
    "core/whimsalot",
    "hotland/pyrope",
    "hotland/so-sorry",
    "hotland/tsunderplane",
    "hotland/vulkin",
    "ruins/dummy",
    "ruins/loox",
    "ruins/migosp",
    "ruins/migospel",
    "ruins/moldessa",
    "ruins/moldsmal",
    "ruins/parsnik",
    "ruins/vegetoid",
    "ruins/whimsun",
    "snowdin/chilldrake",
    "snowdin/doggo",
    "snowdin/glyde",
    "snowdin/gyftrot",
    "snowdin/icecap",
    "snowdin/jerry",
    "snowdin/snowdrake",
    "waterfall/aaron",
    "waterfall/mad-dummy",
    "waterfall/moldbygg",
    "waterfall/shyren",
    "waterfall/woshua",
];

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

#[test]
fn serializes_channel_level_transform_fields_compactly() {
    let transform = TransformExpr {
        offset_x: Some(Expr::parse("sin(siner / 6.0) * 10.0").unwrap()),
        offset_y: None,
        scale_x: Some(Expr::parse("1.0").unwrap()),
        scale_y: None,
        rotation_deg: Some(Expr::parse("sin(siner / 6.0) * -2.0").unwrap()),
        alpha: Some(Expr::parse("0.5").unwrap()),
        frame_index: Some(Expr::parse("floor(siner / 4.0) % 2.0").unwrap()),
    };

    let json = serde_json::to_string_pretty(&transform).unwrap();

    assert!(json.contains(r#""offset_x": "sin(siner / 6.0) * 10.0""#));
    assert!(json.contains(r#""scale_x": "1.0""#));
    assert!(json.contains(r#""rotation_deg": "sin(siner / 6.0) * -2.0""#));
    assert!(json.contains(r#""alpha": "0.5""#));
    assert!(json.contains(r#""frame_index": "floor(siner / 4.0) % 2.0""#));
    assert!(!json.contains("offset_y"));
    assert!(!json.contains("scale_y"));
    assert!(!json.contains("position"));
    assert!(!json.contains(r#""scale":"#));
}

#[test]
fn source_enemies_contains_exactly_expected_lab_entry_slugs() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("source/enemies");

    let programs = utrp::source::load_programs(&root).unwrap();
    let actual = programs
        .into_iter()
        .map(|program| program.slug)
        .collect::<Vec<_>>();

    assert_eq!(actual, EXPECTED_SOURCE_SLUGS);
}

#[test]
fn codegen_outputs_gml_and_souprune_starters() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("source/enemies");
    let programs = utrp::source::load_programs(&root).unwrap();
    let mad_dummy = programs
        .iter()
        .find(|program| program.slug == "waterfall/mad-dummy")
        .unwrap();
    let gml = utrp::codegen::gml::generate(mad_dummy);
    let souprune = utrp::codegen::souprune::generate(mad_dummy);

    assert!(gml.contains("/// Mad Dummy Create Event"));
    assert!(gml.contains("draw_sprite_ext"));
    assert!(gml.contains("sin(siner / 7.5)"));
    assert!(souprune.contains("use souprune_schema::view::*;"));
    assert!(souprune.contains("pub fn asset() -> ViewLayoutAsset"));
}
