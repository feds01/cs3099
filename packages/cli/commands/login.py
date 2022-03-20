import json
import click
from utils.call_api import call_api
from urllib.parse import urljoin


@click.command()
@click.option("--username", prompt="Username", help="Username", type=str)
@click.option(
    "--password", prompt="Password", hide_input=True, help="Password", type=str
)
@click.pass_context
def login(ctx: click.core.Context, username: str, password: str) -> None:
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
