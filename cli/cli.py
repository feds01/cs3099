import json
import click
import requests
from pathlib import Path
from urllib.parse import urljoin

from commands.show import show
from commands.login import login
from commands.logout import logout
from commands.upload import upload
from commands.revise import revise


cli_path = Path(__file__).parent


@click.group()
@click.pass_context
def cli(ctx: click.core.Context) -> None:
    # ensure that ctx.obj exists and is a dict (in case `cli()` is called
    # by means other than the `if` block below)
    ctx.ensure_object(dict)

    ctx.obj["CLI_PATH"] = cli_path
    config_file = cli_path / "config/config.json"
    try:
        with open(config_file, "r") as f:
            config = json.load(f)
            ctx.obj["BASE_URL"] = config["baseUrl"]

        # chekc if base url is reachable:
        version_api = urljoin(ctx.obj["BASE_URL"], "version")
        requests.get(version_api)
    except FileNotFoundError:
        click.echo("No config.json found. Please create one.")
        exit(1)
    except requests.exceptions.RequestException as e:
        click.echo("Base URL is not reachable")
        exit(1)
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        exit(1)


cli.add_command(show)
cli.add_command(login)
cli.add_command(logout)
cli.add_command(upload)
cli.add_command(revise)

if __name__ == "__main__":
    cli(obj={})
