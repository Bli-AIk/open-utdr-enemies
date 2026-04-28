use std::path::Path;

use tempfile::TempDir;
use utrp::expr::Expr;
use utrp::ir::*;

fn program(slug: &str, name: &str) -> RenderProgram {
    RenderProgram {
        format: "utrp".into(),
        version: 1,
        slug: slug.into(),
        name: name.into(),
        fps: 30,
        canvas: CanvasDef {
            width: 110,
            height: 186,
            scale: 2.0,
        },
        coordinate_space: CoordinateSpace::gms(),
        review: ReviewInfo::needs_source_review("fixture"),
        variables: vec![VariableDef::counter("siner", 1.0)],
        assets: vec![SpriteAsset::single("head", "/sprites/demo/head.png")],
        update: vec![UpdateOp::increment("siner", Expr::number(1.0))],
        draw: Vec::new(),
        codegen: Default::default(),
    }
}

fn sprite_draw(id: &str, sprite: &str) -> DrawOp {
    DrawOp::Sprite(SpriteDraw {
        id: id.into(),
        sprite: sprite.into(),
        origin: Vec2::new(0.0, 0.0),
        pivot: None,
        transform: TransformExpr::default(),
        draw_order: 0,
    })
}

fn write_program(path: &Path, program: &RenderProgram) {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).unwrap();
    }
    std::fs::write(path, serde_json::to_string_pretty(program).unwrap()).unwrap();
}

fn error_contains(error: &anyhow::Error, needle: &str) -> bool {
    error
        .chain()
        .any(|cause| cause.to_string().contains(needle))
}

#[test]
fn loads_programs_recursively_sorted_by_path() {
    let temp = TempDir::new().unwrap();
    write_program(&temp.path().join("zeta.json"), &program("zeta", "Zeta"));
    write_program(
        &temp.path().join("nested/alpha.json"),
        &program("nested/alpha", "Alpha"),
    );

    let programs = utrp::source::load_programs(temp.path()).unwrap();

    assert_eq!(
        programs
            .into_iter()
            .map(|program| program.slug)
            .collect::<Vec<_>>(),
        vec!["nested/alpha", "zeta"]
    );
}

#[test]
fn accepts_safe_slug_with_directory_segments() {
    let temp = TempDir::new().unwrap();
    write_program(
        &temp.path().join("core/finalfroggit.json"),
        &program("core/finalfroggit", "Final Froggit"),
    );

    let programs = utrp::source::load_programs(temp.path()).unwrap();

    assert_eq!(programs[0].slug, "core/finalfroggit");
}

#[test]
fn rejects_unsafe_slugs() {
    for slug in [
        "../index",
        "core/../x",
        "core//x",
        "Core/Foo",
        "core/foo_bar",
        "/absolute",
    ] {
        let temp = TempDir::new().unwrap();
        write_program(&temp.path().join("bad.json"), &program(slug, "Bad"));

        let error = utrp::source::load_programs(temp.path()).unwrap_err();

        assert!(
            error.to_string().contains("unsafe slug"),
            "unexpected error for {slug}: {error}"
        );
    }
}

#[test]
fn rejects_invalid_format() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid.format = "utaf".into();
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error.to_string().contains("unsupported format"));
}

#[test]
fn rejects_unsupported_version() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("future", "Future");
    invalid.version = 2;
    write_program(&temp.path().join("future.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error.to_string().contains("unsupported version"));
}

#[test]
fn rejects_missing_root() {
    let temp = TempDir::new().unwrap();
    let missing = temp.path().join("missing");

    let error = utrp::source::load_programs(&missing).unwrap_err();

    assert!(error.to_string().contains("does not exist"));
}

#[test]
fn rejects_file_root() {
    let temp = TempDir::new().unwrap();
    let file = temp.path().join("root.json");
    write_program(&file, &program("root", "Root"));

    let error = utrp::source::load_programs(&file).unwrap_err();

    assert!(error.to_string().contains("not a directory"));
}

#[test]
fn rejects_source_file_path_that_does_not_match_slug() {
    let temp = TempDir::new().unwrap();
    write_program(
        &temp.path().join("core/finalfroggit.json"),
        &program("core/astigmatism", "Astigmatism"),
    );

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error.to_string().contains("does not match slug"));
}

#[test]
fn rejects_non_empty_source_codegen() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid
        .codegen
        .insert("GML".into(), "/generated-code/bad.gml.txt".into());
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "source codegen must be empty"));
}

#[test]
fn rejects_duplicate_asset_ids() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid
        .assets
        .push(SpriteAsset::single("head", "/sprites/demo/other.png"));
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "duplicate asset id `head`"));
}

#[test]
fn rejects_assets_without_frames() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid.assets[0].frames.clear();
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "has no frames"));
}

#[test]
fn rejects_unsafe_asset_paths() {
    for (path, expected) in [
        ("sprites/demo/head.png", "site-root absolute"),
        ("/sprites/../head.png", "must not contain `..`"),
        ("/sprites\\demo\\head.png", "must not contain backslashes"),
    ] {
        let temp = TempDir::new().unwrap();
        let mut invalid = program("bad", "Bad");
        invalid.assets[0].path = path.into();
        invalid.assets[0].frames = vec!["/sprites/demo/head.png".into()];
        write_program(&temp.path().join("bad.json"), &invalid);

        let error = utrp::source::load_programs(temp.path()).unwrap_err();

        assert!(
            error_contains(&error, expected),
            "unexpected error for {path}: {error:#}"
        );
    }
}

#[test]
fn rejects_unsafe_asset_frame_paths() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid.assets[0].frames = vec!["/sprites/demo/head.png".into(), "../head.png".into()];
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "must not contain `..`"));
}

#[test]
fn rejects_duplicate_draw_ids() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid.draw = vec![sprite_draw("head", "head"), sprite_draw("head", "head")];
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "duplicate draw id `head`"));
}

#[test]
fn rejects_draw_sprite_without_matching_asset() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid.draw = vec![sprite_draw("head", "missing")];
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "unknown asset `missing`"));
}

#[test]
fn rejects_duplicate_variable_names() {
    let temp = TempDir::new().unwrap();
    let mut invalid = program("bad", "Bad");
    invalid.variables.push(VariableDef::counter("siner", 0.0));
    write_program(&temp.path().join("bad.json"), &invalid);

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error_contains(&error, "duplicate variable `siner`"));
}
