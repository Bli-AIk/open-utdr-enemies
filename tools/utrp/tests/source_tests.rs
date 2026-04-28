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

fn write_program(path: &Path, program: &RenderProgram) {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).unwrap();
    }
    std::fs::write(path, serde_json::to_string_pretty(program).unwrap()).unwrap();
}

#[test]
fn loads_programs_recursively_sorted_by_path() {
    let temp = TempDir::new().unwrap();
    write_program(&temp.path().join("zeta.json"), &program("zeta", "Zeta"));
    write_program(
        &temp.path().join("nested/alpha.json"),
        &program("alpha", "Alpha"),
    );

    let programs = utrp::source::load_programs(temp.path()).unwrap();

    assert_eq!(
        programs
            .into_iter()
            .map(|program| program.slug)
            .collect::<Vec<_>>(),
        vec!["alpha", "zeta"]
    );
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
fn rejects_duplicate_slugs() {
    let temp = TempDir::new().unwrap();
    write_program(&temp.path().join("a.json"), &program("dupe", "One"));
    write_program(&temp.path().join("nested/b.json"), &program("dupe", "Two"));

    let error = utrp::source::load_programs(temp.path()).unwrap_err();

    assert!(error.to_string().contains("duplicate slug `dupe`"));
}
