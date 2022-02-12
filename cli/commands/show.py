import click
import requests


@click.command()
@click.pass_obj
def show(obj: dict[str, str]) -> None:
    base_url = obj["BASE_URL"]
    username, headers = obj["AUTH"]
    if username is None or headers is None:
        click.echo("Please login first")
        return

    publications_res = requests.get(f"{base_url}/publication/{username}", headers=headers).json()
    if publications_res["status"] is True:
        publications = publications_res["data"]
        print("Listing all publications available:")
        for pub in publications:
            print(f"{pub['title']} ({pub['revision']}) : {pub['id']}")
    else:
        print("No publications found")
