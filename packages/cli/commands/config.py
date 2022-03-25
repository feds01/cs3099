import json
import click

from utils.callback import callback_wrapper, url_validator


@click.command()
@click.option(
    "--base-url",
    "base_url",
    prompt="Base Url",
    help="Base Url of the server",
    type=str,
    callback=callback_wrapper(url_validator),
)
@click.pass_context
def config(ctx: click.core.Context, base_url: str) -> None:
    """CLI command for the user to configure the base url of the server.

    Usage:
        $ iamus config --base-url <base-url>

    Args:
        ctx (click.core.Context): Context object to share global variables with
            subcommands.
        base_url (str): The base url of the server specified by the user.
    """
    config_file = ctx.obj["CLI_PATH"] / "config/config.json"
    try:
        with open(config_file, "r") as f:
            config = json.load(f)
        click.echo(f"The current base url is {config['baseUrl']}")
        click.confirm(f"Do you want to change it to {base_url} ?", abort=True)
    except (KeyError, FileNotFoundError):
        pass

    config = {"baseUrl": base_url}
    with open(config_file, "w") as f:
        json.dump(config, f)
    click.echo(f"The base url is set to {base_url}")
