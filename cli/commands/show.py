import click
import requests
from utils.auth import authed


@click.command()
@click.pass_obj
@authed
def show(
    obj: dict[str, str], username: str = None, headers: dict[str, str] = None
) -> None:
    base_url = obj["BASE_URL"]

    publications_res = requests.get(
        f"{base_url}/publication/{username}", headers=headers
    ).json()
    if publications_res["status"] is True:
        publications = publications_res["data"]
        print("Listing all publications available:")
        for pub in publications:
            print(f"{pub['title']} ({pub['revision']}) : {pub['id']}")
    else:
        print("No publications found")
