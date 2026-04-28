use crate::ir::RenderProgram;
use crate::source::validate_slug;
use anyhow::{Context, bail};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
use std::io::{Error, ErrorKind};
use std::path::{Path, PathBuf};

pub const OUTPUT_MANIFEST_FILE: &str = ".utrp-output-manifest";
const LEGACY_OUTPUT_MANIFEST_FILE: &str = ".utrp-output-manifest.json";

#[derive(Debug, Default, Deserialize, Serialize)]
struct OutputManifest {
    files: Vec<String>,
}

pub fn write_program_outputs(programs: &[RenderProgram], output: &Path) -> anyhow::Result<()> {
    std::fs::create_dir_all(output)
        .with_context(|| format!("failed to create {}", output.display()))?;
    ensure_not_symlink(output)?;

    let previous = read_manifest(output)?;
    let expected = programs
        .iter()
        .map(|program| output_relative_path(&program.slug))
        .collect::<anyhow::Result<BTreeSet<_>>>()?;

    remove_stale_outputs(output, &previous, &expected)?;

    for program in programs {
        validate_slug(&program.slug)?;
        let relative = output_relative_path(&program.slug)?;
        let generated = with_codegen_urls(program);
        write_output_file(
            output,
            &relative,
            &(serde_json::to_string_pretty(&generated)
                .with_context(|| format!("failed to serialize {}", program.slug))?
                + "\n"),
        )?;
    }

    write_manifest(output, expected)
}

pub fn write_codegen_outputs(programs: &[RenderProgram], output: &Path) -> anyhow::Result<()> {
    std::fs::create_dir_all(output)
        .with_context(|| format!("failed to create {}", output.display()))?;
    ensure_not_symlink(output)?;

    let expected = programs
        .iter()
        .flat_map(|program| {
            [
                codegen_relative_path(&program.slug, CodegenKind::Gml),
                codegen_relative_path(&program.slug, CodegenKind::SoupRune),
            ]
        })
        .collect::<anyhow::Result<BTreeSet<_>>>()?;

    remove_stale_codegen_outputs(output, &expected)?;

    for program in programs {
        validate_slug(&program.slug)?;
        write_output_file(
            output,
            &codegen_relative_path(&program.slug, CodegenKind::Gml)?,
            &crate::codegen::gml::generate(program),
        )?;
        write_output_file(
            output,
            &codegen_relative_path(&program.slug, CodegenKind::SoupRune)?,
            &crate::codegen::souprune::generate(program),
        )?;
    }

    Ok(())
}

fn output_relative_path(slug: &str) -> anyhow::Result<String> {
    validate_slug(slug)?;
    Ok(format!("{slug}.json"))
}

#[derive(Clone, Copy)]
enum CodegenKind {
    Gml,
    SoupRune,
}

fn codegen_relative_path(slug: &str, kind: CodegenKind) -> anyhow::Result<String> {
    validate_slug(slug)?;
    let extension = match kind {
        CodegenKind::Gml => "gml.txt",
        CodegenKind::SoupRune => "souprune.rs.txt",
    };
    Ok(format!("{slug}.{extension}"))
}

fn with_codegen_urls(program: &RenderProgram) -> RenderProgram {
    let mut generated = program.clone();
    generated.codegen = BTreeMap::from([
        (
            "GML".to_string(),
            format!("/generated-code/{}.gml.txt", program.slug),
        ),
        (
            "SoupRune".to_string(),
            format!("/generated-code/{}.souprune.rs.txt", program.slug),
        ),
    ]);
    generated
}

fn read_manifest(output: &Path) -> anyhow::Result<BTreeSet<String>> {
    let path = manifest_path(output)?;
    match std::fs::symlink_metadata(&path) {
        Ok(metadata) if metadata.file_type().is_symlink() => {
            bail!(
                "refusing to read manifest through symlink {}",
                path.display()
            );
        }
        Ok(_) => {}
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(BTreeSet::new()),
        Err(error) => {
            return Err(error)
                .with_context(|| format!("failed to inspect manifest {}", path.display()));
        }
    }

    let raw = std::fs::read_to_string(&path)
        .with_context(|| format!("failed to read {}", path.display()))?;
    let manifest: OutputManifest = serde_json::from_str(&raw)
        .with_context(|| format!("failed to parse {}", path.display()))?;
    Ok(manifest.files.into_iter().collect())
}

fn write_manifest(output: &Path, files: BTreeSet<String>) -> anyhow::Result<()> {
    let path = output.join(OUTPUT_MANIFEST_FILE);
    match std::fs::symlink_metadata(&path) {
        Ok(metadata) if metadata.file_type().is_symlink() => {
            bail!(
                "refusing to write manifest through symlink {}",
                path.display()
            );
        }
        Ok(_) => {}
        Err(error) if error.kind() == ErrorKind::NotFound => {}
        Err(error) => {
            return Err(error)
                .with_context(|| format!("failed to inspect manifest {}", path.display()));
        }
    }

    let manifest = OutputManifest {
        files: files.into_iter().collect(),
    };
    std::fs::write(&path, serde_json::to_string_pretty(&manifest)? + "\n")
        .with_context(|| format!("failed to write {}", path.display()))?;
    remove_legacy_manifest(output)?;
    Ok(())
}

fn remove_stale_outputs(
    output: &Path,
    previous: &BTreeSet<String>,
    expected: &BTreeSet<String>,
) -> anyhow::Result<()> {
    for relative in previous.difference(expected) {
        validate_manifest_path(relative)?;
        let path = output.join(relative);
        ensure_no_symlink_components(output, Path::new(relative))?;
        match std::fs::symlink_metadata(&path) {
            Ok(metadata) if metadata.file_type().is_symlink() => {
                bail!(
                    "refusing to remove stale output through symlink {}",
                    path.display()
                );
            }
            Ok(_) => {
                std::fs::remove_file(&path)
                    .with_context(|| format!("failed to remove stale output {}", path.display()))?;
                remove_empty_parents(output, path.parent())?;
            }
            Err(error) if error.kind() == ErrorKind::NotFound => {}
            Err(error) => {
                return Err(error)
                    .with_context(|| format!("failed to inspect stale output {}", path.display()));
            }
        }
    }
    Ok(())
}

fn remove_stale_codegen_outputs(output: &Path, expected: &BTreeSet<String>) -> anyhow::Result<()> {
    let mut files = Vec::new();
    collect_files(output, output, &mut files)?;
    for relative in files {
        if !is_codegen_output(&relative) || expected.contains(&relative) {
            continue;
        }
        let path = output.join(&relative);
        ensure_no_symlink_components(output, Path::new(&relative))?;
        std::fs::remove_file(&path)
            .with_context(|| format!("failed to remove stale generated code {}", path.display()))?;
        remove_empty_parents(output, path.parent())?;
    }
    Ok(())
}

fn collect_files(output: &Path, current: &Path, files: &mut Vec<String>) -> anyhow::Result<()> {
    for entry in std::fs::read_dir(current)
        .with_context(|| format!("failed to read {}", current.display()))?
    {
        let entry = entry.with_context(|| format!("failed to read {}", current.display()))?;
        let path = entry.path();
        let metadata = std::fs::symlink_metadata(&path)
            .with_context(|| format!("failed to inspect {}", path.display()))?;
        if metadata.file_type().is_symlink() {
            bail!(
                "refusing to access output through symlink {}",
                path.display()
            );
        }
        if metadata.is_dir() {
            collect_files(output, &path, files)?;
        } else if metadata.is_file() {
            let relative = path
                .strip_prefix(output)
                .with_context(|| format!("failed to relativize {}", path.display()))?;
            files.push(relative.to_string_lossy().replace('\\', "/"));
        }
    }
    Ok(())
}

fn is_codegen_output(relative: &str) -> bool {
    relative.ends_with(".gml.txt") || relative.ends_with(".souprune.rs.txt")
}

fn validate_manifest_path(relative: &str) -> anyhow::Result<()> {
    let slug = relative
        .strip_suffix(".json")
        .with_context(|| format!("manifest entry `{relative}` does not end with .json"))?;
    validate_slug(slug)
}

fn remove_empty_parents(output: &Path, mut current: Option<&Path>) -> anyhow::Result<()> {
    while let Some(path) = current {
        if path == output {
            break;
        }
        if std::fs::symlink_metadata(path)?.file_type().is_symlink() {
            bail!(
                "refusing to inspect symlinked output directory {}",
                path.display()
            );
        }
        if path.read_dir()?.next().is_some() {
            break;
        }
        std::fs::remove_dir(path)
            .with_context(|| format!("failed to remove empty directory {}", path.display()))?;
        current = path.parent();
    }
    Ok(())
}

fn write_output_file(output: &Path, relative: &str, contents: &str) -> anyhow::Result<()> {
    let relative_path = Path::new(relative);
    let path = output.join(relative_path);
    if let Some(parent) = relative_path.parent() {
        ensure_no_symlink_components(output, parent)?;
    }
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("failed to create {}", parent.display()))?;
    }
    ensure_no_symlink_components(output, relative_path)?;
    std::fs::write(&path, contents).with_context(|| format!("failed to write {}", path.display()))
}

fn manifest_path(output: &Path) -> anyhow::Result<PathBuf> {
    let path = output.join(OUTPUT_MANIFEST_FILE);
    match std::fs::symlink_metadata(&path) {
        Ok(_) => return Ok(path),
        Err(error) if error.kind() == ErrorKind::NotFound => {}
        Err(error) => {
            return Err(error)
                .with_context(|| format!("failed to inspect manifest {}", path.display()));
        }
    }

    let legacy = output.join(LEGACY_OUTPUT_MANIFEST_FILE);
    match std::fs::symlink_metadata(&legacy) {
        Ok(_) => Ok(legacy),
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(path),
        Err(error) => {
            Err(error).with_context(|| format!("failed to inspect manifest {}", legacy.display()))
        }
    }
}

fn remove_legacy_manifest(output: &Path) -> anyhow::Result<()> {
    let legacy = output.join(LEGACY_OUTPUT_MANIFEST_FILE);
    match std::fs::symlink_metadata(&legacy) {
        Ok(metadata) if metadata.file_type().is_symlink() => {
            bail!(
                "refusing to remove legacy manifest through symlink {}",
                legacy.display()
            );
        }
        Ok(metadata) if metadata.is_file() => std::fs::remove_file(&legacy)
            .with_context(|| format!("failed to remove legacy manifest {}", legacy.display())),
        Ok(_) => Ok(()),
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(()),
        Err(error) => {
            Err(error).with_context(|| format!("failed to inspect manifest {}", legacy.display()))
        }
    }
}

fn ensure_no_symlink_components(output: &Path, relative: &Path) -> anyhow::Result<()> {
    let mut current = PathBuf::from(output);
    for component in relative.components() {
        current.push(component);
        match std::fs::symlink_metadata(&current) {
            Ok(metadata) if metadata.file_type().is_symlink() => {
                bail!(
                    "refusing to access output through symlink {}",
                    current.display()
                );
            }
            Ok(_) => {}
            Err(error) if error.kind() == ErrorKind::NotFound => break,
            Err(error) => {
                return Err(error)
                    .with_context(|| format!("failed to inspect {}", current.display()));
            }
        }
    }
    Ok(())
}

fn ensure_not_symlink(path: &Path) -> anyhow::Result<()> {
    let metadata = std::fs::symlink_metadata(path)
        .with_context(|| format!("failed to inspect {}", path.display()))?;
    if metadata.file_type().is_symlink() {
        return Err(Error::new(
            ErrorKind::InvalidInput,
            format!(
                "refusing to use output directory symlink {}",
                path.display()
            ),
        )
        .into());
    }
    Ok(())
}
