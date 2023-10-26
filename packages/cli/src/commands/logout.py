import os
import click


@click.command()
@click.pass_context
def logout(ctx: click.core.Context) -> None:
    """CLI command for the user to clear their user session.

    \b
    Usage:
        $ iamus logout

    \f
    Args:
        ctx (click.core.Context): Context object to share global variables with
            subcommands.
    """
    try:
        auth_file = ctx.obj["CLI_PATH"] / "config/auth.json"
        os.remove(auth_file)
        click.echo("Logout successfully")
    except FileNotFoundError:
        click.echo("You are not logged in")
