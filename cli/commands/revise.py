import click
import requests
from utils.custom import Mutex
from utils.auth import authenticated
from utils.publication import get_id_name


@click.command()
@click.option(
    "--id",
    "id_",
    prompt="Publication ID",
    help="Publication ID",
    cls=Mutex,
    type=str,
    not_required_if=["name"],
)
@click.option(
    "--name",
    prompt="Publication Name",
    help="Publication Name",
    cls=Mutex,
    type=str,
    not_required_if=["id_"],
)
@click.pass_context
@authenticated
def revise(
    ctx: click.core.Context,
    id_: str = None,
    name: str = None,
    username: str = None,
    headers: dict[str, str] = None,
) -> None:
    base_url = ctx.obj["BASE_URL"]

    id_, name = get_id_name(base_url, username, headers, id_, name)
    if not all([id_, name]):
        return

    revise_api = f"{base_url}/publication/{username}/{name}/revise"
    revision = click.prompt("Revision number", type=str)
    changelog = click.prompt("Changelog", type=str)
    data = {"revision": revision, "changelog": changelog}

    try:
        revise_res = requests.post(revise_api, data=data, headers=headers).json()
        new_id = revise_res["publication"]["id"]
        click.echo(
            f"Success: Revision {revision} of {name}({id_}) created as {name}({new_id})"
        )
        return new_id
    except KeyError:
        click.echo(f"Error: {revise_res['message']}")
        click.echo(revise_res["errors"])
    return
