import click
import requests
from utils.auth import authenticated


@click.command()
@click.pass_context
@authenticated
def show(
    ctx: click.core.Context, username: str = None, headers: dict[str, str] = None
) -> None:
    base_url = ctx.obj["BASE_URL"]

    publications_res = requests.get(
        f"{base_url}/publication/{username}", headers=headers
    ).json()
    if publications_res["status"] == "ok":
        publications = publications_res["publications"]
        print("Listing all publications available:")
        for pub in publications:
            print(f"{pub['title']} ({pub['revision']}) : {pub['id']}")
    else:
        print("No publications found")
