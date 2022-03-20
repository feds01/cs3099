import click
from urllib.parse import urljoin
from utils.call_api import call_api
from utils.auth import authenticated


@click.command()
@click.pass_context
@authenticated
def show(
    ctx: click.core.Context, username: str = None, headers: dict[str, str] = None
) -> None:
    base_url = ctx.obj["BASE_URL"]

    show_api = urljoin(base_url, f"publication/{username}")
    try:
        show_res = call_api("GET", show_api, headers=headers)
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        exit(1)

    if show_res["status"] == "ok":
        publications = show_res["publications"]
        print("Listing all publications of the latest version:")
        for pub in publications:
            pub_url = urljoin(base_url, f"publication/{pub['id']}")
            print(f"{pub['title']} ({pub['revision']}) - {pub_url}")
    else:
        print("No publications found")
