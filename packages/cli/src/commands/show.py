import sys
import click
from posixpath import join as urljoin

from utils.call_api import call_api
from utils.auth import authenticated
from utils.base_url import pass_base_url


@click.command()
@click.pass_context
@pass_base_url
@authenticated
def show(
    ctx: click.core.Context, username: str = None, headers: dict[str, str] = None
) -> None:
    """CLI command showing all publications the current user is owning.

    \b
    The publications are shown in the following format:
    <name> (<revision>) - <url>

    \b
    Usage:
        $ iamus show

    \f
    Args:
        ctx (click.core.Context): Context object to share global variables with
            subcommands.
        username (str): The username obtained from the auth file.
        headers (dict[str, str]): The headers obtained from the auth file, which
            contains token for sending the request.
    """
    base_url = ctx.obj["BASE_URL"]

    show_api = urljoin(base_url, f"publication/{username}")
    try:
        show_res = call_api("GET", show_api, headers=headers)
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        sys.exit(1)

    if show_res["status"] == "ok":
        publications = show_res["publications"]
        click.echo("Listing all publications of the latest version:")
        for pub in publications:
            pub_url = urljoin(base_url, f"publication/{pub['id']}")
            click.echo(f"{pub['name']} ({pub['revision']}) - {pub_url}")
    else:
        click.echo("No publications found")
