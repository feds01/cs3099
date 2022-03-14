import json
import click
import requests


@click.command()
@click.option("--username", prompt="Username", help="Username", type=str)
@click.option(
    "--password", prompt="Password", hide_input=True, help="Password", type=str
)
@click.pass_context
def login(ctx: click.core.Context, username: str, password: str) -> None:
    base_url = ctx.obj["BASE_URL"]
    login_body = {"username": username, "password": password}
    login_res = requests.post(f"{base_url}/auth/login", data=login_body).json()
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
