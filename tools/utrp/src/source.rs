use crate::ir::RenderProgram;
use anyhow::{Context, bail};
use std::path::{Path, PathBuf};

pub fn load_programs(root: &Path) -> anyhow::Result<Vec<RenderProgram>> {
    let mut paths = Vec::new();
    collect_json_paths(root, &mut paths)?;
    paths.sort();

    paths
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
            Ok(program)
        })
        .collect()
}

fn collect_json_paths(root: &Path, paths: &mut Vec<PathBuf>) -> anyhow::Result<()> {
    if !root.exists() {
        return Ok(());
    }

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
