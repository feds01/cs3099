import json
import click
from urllib.parse import urljoin
from utils.call_api import call_api

from utils.base_url import pass_base_url


@click.command()
@click.option("--username", prompt="Username", help="Username", type=str)
@click.option(
    "--password", prompt="Password", hide_input=True, help="Password", type=str
)
@click.pass_context
@pass_base_url
def login(ctx: click.core.Context, username: str, password: str) -> None:
    """CLI command for user to login and get token before sending request.

    Usage:
        $ iamus login --username <username> --password <password>

    Args:
        ctx (click.core.Context): Context object to share global variables with
            subcommands.
        username (str): The username specified by the user.
        password (str): The password specified by the user.
    """
    base_url = ctx.obj["BASE_URL"]
    login_body = {"username": username, "password": password}
    try:
        login_api = urljoin(base_url, "auth/login")
        login_res = call_api("POST", login_api, data=login_body)
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        exit(1)

    if login_res["status"] == "ok":
        data = {
            "username": username,
            "token": login_res["token"],
            "refreshToken": login_res["refreshToken"],
        }
        auth_file = ctx.obj["CLI_PATH"] / "config/auth.json"
        with open(auth_file, "w") as f:
            json.dump(data, f)
        click.echo("Login successfully")
    else:
        click.echo("Login failed")
