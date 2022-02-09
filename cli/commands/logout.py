import os
import click


@click.command()
@click.pass_obj
def logout(obj: dict) -> None:
    try:
        auth_file = obj["CLI_PATH"] / "./config/auth.json"
        os.remove(auth_file)
        click.echo("Logout successfully")
    except FileNotFoundError:
        click.echo("You are not logged in")
