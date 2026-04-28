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

#[test]
fn generated_outputs_include_codegen_urls_without_mutating_sources() {
    let temp = TempDir::new().unwrap();
    let output = temp.path();
    let source_program = program("core/finalfroggit", "Final Froggit");

    utrp::output::write_program_outputs(std::slice::from_ref(&source_program), output).unwrap();

    assert!(source_program.codegen.is_empty());
    let generated = std::fs::read_to_string(output.join("core/finalfroggit.json")).unwrap();
    let generated: RenderProgram = serde_json::from_str(&generated).unwrap();

    assert_eq!(
        generated.codegen,
        std::collections::BTreeMap::from([
            (
                "GML".to_string(),
                "/generated-code/core/finalfroggit.gml.txt".to_string(),
            ),
            (
                "SoupRune".to_string(),
                "/generated-code/core/finalfroggit.souprune.rs.txt".to_string(),
            ),
        ])
    );
}

#[cfg(unix)]
#[test]
fn generated_write_refuses_symlinked_output_directory_component() {
    use std::os::unix::fs::symlink;

    let temp = TempDir::new().unwrap();
    let output = temp.path().join("output");
    let outside = temp.path().join("outside");
    std::fs::create_dir_all(&output).unwrap();
    std::fs::create_dir_all(&outside).unwrap();
    symlink(&outside, output.join("core")).unwrap();

    let error =
        utrp::output::write_program_outputs(&[program("core/new", "New")], &output).unwrap_err();

    assert!(error.to_string().contains("symlink"));
    assert!(!outside.join("new.json").exists());
}

#[cfg(unix)]
#[test]
fn manifest_read_refuses_symlinked_manifest_file() {
    use std::os::unix::fs::symlink;

    let temp = TempDir::new().unwrap();
    let output = temp.path().join("output");
    let outside = temp.path().join("outside-manifest.json");
    std::fs::create_dir_all(&output).unwrap();
    std::fs::write(&outside, r#"{"files":[]}"#).unwrap();
    symlink(&outside, output.join(utrp::output::OUTPUT_MANIFEST_FILE)).unwrap();

    let error =
        utrp::output::write_program_outputs(&[program("root", "Root")], &output).unwrap_err();

    assert!(error.to_string().contains("symlink"));
    assert_eq!(
        std::fs::read_to_string(&outside).unwrap(),
        r#"{"files":[]}"#
    );
}

#[cfg(unix)]
#[test]
fn manifest_write_refuses_symlinked_manifest_file() {
    use std::os::unix::fs::symlink;

    let temp = TempDir::new().unwrap();
    let output = temp.path().join("output");
    let outside = temp.path().join("outside-manifest.json");
    std::fs::create_dir_all(&output).unwrap();
    symlink(&outside, output.join(utrp::output::OUTPUT_MANIFEST_FILE)).unwrap();

    let error =
        utrp::output::write_program_outputs(&[program("root", "Root")], &output).unwrap_err();

    assert!(error.to_string().contains("symlink"));
    assert!(!outside.exists());
}

#[cfg(unix)]
#[test]
fn stale_cleanup_refuses_symlinked_output_directory_component() {
    use std::os::unix::fs::symlink;

    let temp = TempDir::new().unwrap();
    let output = temp.path().join("output");
    let outside = temp.path().join("outside");
    std::fs::create_dir_all(&output).unwrap();
    std::fs::create_dir_all(&outside).unwrap();
    std::fs::write(outside.join("old.json"), "{}\n").unwrap();
    std::fs::write(
        output.join(utrp::output::OUTPUT_MANIFEST_FILE),
        r#"{"files":["core/old.json"]}"#,
    )
    .unwrap();
    symlink(&outside, output.join("core")).unwrap();

    let error = utrp::output::write_program_outputs(&[], &output).unwrap_err();

    assert!(error.to_string().contains("symlink"));
    assert!(outside.join("old.json").exists());
}

#[test]
fn stale_cleanup_rejects_malformed_manifest_entries_without_deleting_files() {
    let temp = TempDir::new().unwrap();
    let output = temp.path().join("output");
    std::fs::create_dir_all(&output).unwrap();
    let outside = temp.path().join("outside.json");
    std::fs::write(&outside, "{}\n").unwrap();
    std::fs::write(
        output.join(utrp::output::OUTPUT_MANIFEST_FILE),
        r#"{"files":["../outside.json"]}"#,
    )
    .unwrap();

    let error = utrp::output::write_program_outputs(&[], &output).unwrap_err();

    assert!(error.to_string().contains("unsafe slug"));
    assert!(outside.exists());
}
