use crate::ir::{DrawOp, RenderProgram};
use anyhow::{Context, bail};
use std::collections::{BTreeMap, BTreeSet};
use std::path::{Component, Path, PathBuf};

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
            validate_path_matches_slug(root, &path, &program.slug)?;
            validate_program(&program)
                .with_context(|| format!("{} failed source validation", path.display()))?;
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

fn validate_path_matches_slug(root: &Path, path: &Path, slug: &str) -> anyhow::Result<()> {
    let relative = path.strip_prefix(root).with_context(|| {
        format!(
            "failed to resolve {} under {}",
            path.display(),
            root.display()
        )
    })?;
    let expected = slug_from_relative_path(relative)?;
    if expected != slug {
        bail!(
            "{} path slug `{}` does not match slug `{}`",
            path.display(),
            expected,
            slug
        );
    }
    Ok(())
}

fn slug_from_relative_path(relative: &Path) -> anyhow::Result<String> {
    let mut segments = Vec::new();
    for component in relative.components() {
        let Component::Normal(segment) = component else {
            bail!(
                "source path {} contains non-normal components",
                relative.display()
            );
        };
        let segment = segment
            .to_str()
            .with_context(|| format!("source path {} is not valid UTF-8", relative.display()))?;
        segments.push(segment.to_string());
    }

    let Some(file_name) = segments.last_mut() else {
        bail!("source path {} is empty", relative.display());
    };
    let Some(stem) = file_name.strip_suffix(".json") else {
        bail!("source path {} does not end with .json", relative.display());
    };
    *file_name = stem.to_string();
    Ok(segments.join("/"))
}

fn validate_program(program: &RenderProgram) -> anyhow::Result<()> {
    if !program.codegen.is_empty() {
        bail!("source codegen must be empty for `{}`", program.slug);
    }

    let mut variable_names = BTreeSet::new();
    for variable in &program.variables {
        if !variable_names.insert(&variable.name) {
            bail!(
                "duplicate variable `{}` in `{}`",
                variable.name,
                program.slug
            );
        }
    }

    let mut asset_ids = BTreeSet::new();
    for asset in &program.assets {
        if !asset_ids.insert(&asset.id) {
            bail!("duplicate asset id `{}` in `{}`", asset.id, program.slug);
        }
        if asset.frames.is_empty() {
            bail!("asset `{}` in `{}` has no frames", asset.id, program.slug);
        }
        validate_asset_path(&asset.path)
            .with_context(|| format!("asset `{}` path in `{}`", asset.id, program.slug))?;
        for frame in &asset.frames {
            validate_asset_path(frame)
                .with_context(|| format!("asset `{}` frame in `{}`", asset.id, program.slug))?;
        }
    }

    let mut draw_ids = BTreeSet::new();
    for draw in &program.draw {
        match draw {
            DrawOp::Sprite(sprite) => {
                if !draw_ids.insert(&sprite.id) {
                    bail!("duplicate draw id `{}` in `{}`", sprite.id, program.slug);
                }
                if !asset_ids.contains(&sprite.sprite) {
                    bail!(
                        "draw `{}` in `{}` references unknown asset `{}`",
                        sprite.id,
                        program.slug,
                        sprite.sprite
                    );
                }
            }
        }
    }

    Ok(())
}

fn validate_asset_path(path: &str) -> anyhow::Result<()> {
    if path.contains('\\') {
        bail!("asset path `{path}` must not contain backslashes");
    }
    if path.contains("..") {
        bail!("asset path `{path}` must not contain `..`");
    }
    if !path.starts_with("/sprites/") {
        bail!("asset path `{path}` must be site-root absolute under /sprites/");
    }
    Ok(())
}
