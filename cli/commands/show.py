import click
from utils.call_api import call_api
from utils.auth import authenticated


@click.command()
@click.pass_context
@authenticated
def show(
    ctx: click.core.Context, username: str = None, headers: dict[str, str] = None
) -> None:
    base_url = ctx.obj["BASE_URL"]

    show_api = f"{base_url}/publication/{username}"
    try:
        show_res = call_api("GET", show_api, headers=headers)
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        exit(1)

    if show_res["status"] == "ok":
        publications = show_res["publications"]
        print("Listing all publications available:")
        for pub in publications:
            print(f"{pub['title']} ({pub['revision']}) : {pub['id']}")
    else:
        print("No publications found")
