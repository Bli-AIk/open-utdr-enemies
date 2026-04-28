use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    Generate {
        #[arg(long)]
        all: bool,
        #[arg(long, default_value = "tools/utrp/source/enemies")]
        source: PathBuf,
        #[arg(long, default_value = "static/utrp")]
        output: PathBuf,
    },
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Command::Generate {
            all: true,
            source,
            output,
        } => {
            let programs = utrp::source::load_programs(&source)?;
            for program in programs {
                let path = output.join(format!("{}.json", program.slug));
                if let Some(parent) = path.parent() {
                    std::fs::create_dir_all(parent)?;
                }
                std::fs::write(path, serde_json::to_string_pretty(&program)? + "\n")?;
            }
        }
        Command::Generate { all: false, .. } => anyhow::bail!("pass --all"),
    }
    Ok(())
}
