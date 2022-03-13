import os
import click


@click.command()
@click.pass_context
def logout(ctx: click.core.Context) -> None:
    try:
        auth_file = ctx.obj["CLI_PATH"] / "./config/auth.json"
        os.remove(auth_file)
        click.echo("Logout successfully")
    except FileNotFoundError:
        click.echo("You are not logged in")
