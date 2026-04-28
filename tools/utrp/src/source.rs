use crate::ir::RenderProgram;
use anyhow::{Context, bail};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

pub fn load_programs(root: &Path) -> anyhow::Result<Vec<RenderProgram>> {
    if !root.exists() {
        bail!("source root {} does not exist", root.display());
    }
    if !root.is_dir() {
        bail!("source root {} is not a directory", root.display());
    }

    let mut paths = Vec::new();
    collect_json_paths(root, &mut paths)?;
    paths.sort();

    let programs = paths
        .into_iter()
        .map(|path| {
            let json = std::fs::read_to_string(&path)
                .with_context(|| format!("failed to read {}", path.display()))?;
            let program: RenderProgram = serde_json::from_str(&json)
                .with_context(|| format!("failed to parse {}", path.display()))?;
            if program.format != "utrp" {
                bail!(
                    "{} has unsupported format `{}`",
                    path.display(),
                    program.format
                );
            }
            Ok((path, program))
        })
        .collect::<anyhow::Result<Vec<_>>>()?;

    validate_unique_slugs(&programs)?;

    Ok(programs
        .into_iter()
        .map(|(_, program)| program)
        .collect::<Vec<_>>())
}

fn collect_json_paths(root: &Path, paths: &mut Vec<PathBuf>) -> anyhow::Result<()> {
    for entry in
        std::fs::read_dir(root).with_context(|| format!("failed to read {}", root.display()))?
    {
        let path = entry?.path();
        if path.is_dir() {
            collect_json_paths(&path, paths)?;
        } else if path
            .extension()
            .is_some_and(|extension| extension == "json")
        {
            paths.push(path);
        }
    }
    Ok(())
}

fn validate_unique_slugs(programs: &[(PathBuf, RenderProgram)]) -> anyhow::Result<()> {
    let mut seen = BTreeMap::new();
    for (path, program) in programs {
        if let Some(previous) = seen.insert(program.slug.clone(), path) {
            bail!(
                "duplicate slug `{}` in {} and {}",
                program.slug,
                previous.display(),
                path.display()
            );
        }
    }
    Ok(())
}
