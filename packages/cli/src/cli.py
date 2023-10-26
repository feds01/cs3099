import sys
import click
from pathlib import Path

from commands.show import show
from commands.login import login
from commands.logout import logout
from commands.upload import upload
from commands.revise import revise
from commands.config import config


if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
    # running in a pyinstall bundle
    cli_path = Path(sys.executable).parent
else:
    cli_path = Path(__file__).parent


@click.group()
@click.pass_context
def cli(ctx: click.core.Context) -> None:
    """Main CLI command which reads the config file and set the global variables.

    \b
    This command is the main entry point which sets the global variables for any 
    other subcommands to use. 

    \f
    Args:
        ctx (click.core.Context): Context object to share global variables with
            subcommands.
    """
    # ensure that ctx.obj exists and is a dict (in case `cli()` is called
    # by means other than the `if` block below)
    ctx.ensure_object(dict)

    ctx.obj["CLI_PATH"] = cli_path

    # create config directory if it doesn't exist
    Path(cli_path / "config").mkdir(exist_ok=True)


cli.add_command(show)
cli.add_command(login)
cli.add_command(logout)
cli.add_command(upload)
cli.add_command(revise)
cli.add_command(config)

if __name__ == "__main__":
    cli(obj={})
