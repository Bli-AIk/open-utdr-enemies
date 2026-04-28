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
            if program.version != 1 {
                bail!(
                    "{} has unsupported version `{}`",
                    path.display(),
                    program.version
                );
            }
            validate_slug(&program.slug).with_context(|| {
                format!("{} has unsafe slug `{}`", path.display(), program.slug)
            })?;
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
        let entry = entry?;
        let file_type = entry.file_type()?;
        let path = entry.path();
        if file_type.is_dir() {
            collect_json_paths(&path, paths)?;
        } else if file_type.is_file()
            && path
                .extension()
                .is_some_and(|extension| extension == "json")
        {
            paths.push(path);
        }
    }
    Ok(())
}

pub fn validate_slug(slug: &str) -> anyhow::Result<()> {
    if slug.is_empty() {
        bail!("unsafe slug `{slug}`: empty slug");
    }
    if slug.starts_with('/') {
        bail!("unsafe slug `{slug}`: absolute paths are not allowed");
    }
    if slug.contains('\\') {
        bail!("unsafe slug `{slug}`: backslashes are not allowed");
    }

    for segment in slug.split('/') {
        if segment.is_empty() {
            bail!("unsafe slug `{slug}`: empty segments are not allowed");
        }
        if matches!(segment, "." | "..") {
            bail!("unsafe slug `{slug}`: dot segments are not allowed");
        }
        if !segment
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
        {
            bail!("unsafe slug `{slug}`: invalid segment `{segment}`");
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
