import json
import click
from typing import Tuple
from pathlib import Path

from commands import show
from commands import login
from commands import logout
from commands import upload

cli_path = Path(__file__).parent


def get_auth() -> Tuple[str, dict]:
    username, headers = None, None
    auth_file = cli_path / "./config/auth.json"
    try:
        with open(auth_file, "r") as f:
            data = json.load(f)
            token = data["token"]
            # refresh_token = data["refreshToken"]
            username = data["username"]
            headers = {"Authorization": f"Bearer {token}"}
    except FileNotFoundError:
        click.echo("No token found. Please login first.")

    return username, headers


@click.group()
@click.pass_context
def cli(ctx: click.core.Context) -> None:
    # ensure that ctx.obj exists and is a dict (in case `cli()` is called
    # by means other than the `if` block below)
    ctx.ensure_object(dict)

    ctx.obj["AUTH"] = get_auth
    ctx.obj["CLI_PATH"] = cli_path
    config_file = cli_path / "./config/config.json"
    try:
        with open(config_file, "r") as f:
            config = json.load(f)
            ctx.obj["BASE_URL"] = config["baseUrl"]
    except FileNotFoundError:
        click.echo("No config.json found. Please create one.")
        exit(1)


cli.add_command(show.show)
cli.add_command(login.login)
cli.add_command(logout.logout)
cli.add_command(upload.upload)

if __name__ == "__main__":
    cli(obj={})
