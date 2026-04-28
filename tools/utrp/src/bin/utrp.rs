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
        #[arg(long, default_value = "static/generated-code")]
        generated_code_output: PathBuf,
    },
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Command::Generate {
            all: true,
            source,
            output,
            generated_code_output,
        } => {
            let programs = utrp::source::load_programs(&source)?;
            utrp::output::write_program_outputs(&programs, &output)?;
            utrp::output::write_codegen_outputs(&programs, &generated_code_output)?;
        }
        Command::Generate { all: false, .. } => anyhow::bail!("pass --all"),
    }
    Ok(())
}
