import click
from urllib.parse import urljoin
from utils.call_api import call_api
from utils.auth import authenticated
from utils.publication import get_id_name
from utils.mutually_exclusive_options import MutuallyExclusiveOptions


@click.command()
@click.option("--revision", prompt="Revision Number", help="Revision Number", type=str)
@click.option("--log", "changelog", prompt="Change Log", help="Change Log", type=str)
@click.option(
    "--id",
    "pub_id",
    prompt="Publication ID",
    help="Publication ID",
    cls=MutuallyExclusiveOptions,
    type=str,
    not_required_if=["name"],
)
@click.option(
    "--name",
    prompt="Publication Name",
    help="Publication Name",
    cls=MutuallyExclusiveOptions,
    type=str,
    not_required_if=["pub_id"],
)
@click.pass_context
@authenticated
def revise(
    ctx: click.core.Context,
    revision: str,
    changelog: str,
    pub_id: str = None,
    name: str = None,
    username: str = None,
    headers: dict[str, str] = None,
) -> None:
    base_url = ctx.obj["BASE_URL"]

    pub_id, name = get_id_name(base_url, username, headers, pub_id, name)
    if not all([pub_id, name]):
        return

    revise_api = urljoin(base_url, f"publication/{username}/{name}/revise")
    data = {"revision": revision, "changelog": changelog}

    try:
        revise_res = call_api("POST", revise_api, data=data, headers=headers)
        new_id = revise_res["publication"]["id"]
        old_pub_url = urljoin(base_url, f"publication/{pub_id}")
        new_pub_url = urljoin(base_url, f"publication/{new_id}")
        click.echo(
            f"Success: Revision of {name}({old_pub_url}) is now at {new_pub_url}"
        )
        return new_id
    except KeyError:
        click.echo(f"Response Error: {revise_res['message']}")
        click.echo(revise_res["errors"])
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        exit(1)
