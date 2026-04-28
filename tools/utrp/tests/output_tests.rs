use tempfile::TempDir;
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
        variables: Vec::new(),
        assets: Vec::new(),
        update: Vec::new(),
        draw: Vec::new(),
        codegen: Default::default(),
    }
}

#[test]
fn generation_manifest_removes_only_previously_owned_stale_files() {
    let temp = TempDir::new().unwrap();
    let output = temp.path();

    utrp::output::write_program_outputs(&[program("core/old", "Old")], output).unwrap();
    let owned_old = output.join("core/old.json");
    let unowned = output.join("manual.json");
    std::fs::write(&unowned, "{}\n").unwrap();

    utrp::output::write_program_outputs(&[program("core/new", "New")], output).unwrap();

    assert!(!owned_old.exists());
    assert!(output.join("core/new.json").exists());
    assert!(unowned.exists());

    let manifest =
        std::fs::read_to_string(output.join(utrp::output::OUTPUT_MANIFEST_FILE)).unwrap();
    assert!(manifest.contains("core/new.json"));
    assert!(!manifest.contains("core/old.json"));
}
