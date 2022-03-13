import click
import requests
from .revise import revise
from zipfile import is_zipfile
from utils.custom import Mutex
from utils.auth import authenticated
from utils.publication import get_id_name


def validate_zipfile(
    ctx: click.core.Context, param: click.types.ParamType, value: str
) -> str:
    if not is_zipfile(value):
        raise click.BadParameter("File must be a zip file")
    return value


@click.command()
@click.option(
    "--file",
    prompt="File Path",
    help="Path of the file to be uploaded",
    type=str,
    callback=validate_zipfile,
)
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
def upload(
    ctx: click.core.Context,
    file: str,
    id_: str = None,
    name: str = None,
    username: str = None,
    headers: dict[str, str] = None,
) -> None:
    base_url = ctx.obj["BASE_URL"]

    id_, name = get_id_name(base_url, username, headers, id_, name)
    if not all([id_, name]):
        return

    upload_api = f"{base_url}/resource/upload/publication/{id_}"
    upload_body = {"file": (file, open(file, "rb"), "application/zip")}
    upload_res = requests.post(upload_api, files=upload_body, headers=headers).json()

    if upload_res["status"] == "ok":
        click.echo(f"Success: File uploaded to {name}({id_})")
        return

    click.echo(f"Error: {upload_res['message']}")
    if (
        upload_res["message"]
        == "Cannot modify publication sources that aren't marked as draft."
    ):
        click.confirm("Do you want to upload it to a new revision?", abort=True)
        new_id = ctx.invoke(
            revise, id_=id_, name=name, username=username, headers=headers
        )
        if new_id is None:
            return
        upload_api = f"{base_url}/resource/upload/publication/{new_id}"
        upload_res = requests.post(
            upload_api, files=upload_body, headers=headers
        ).json()
        if upload_res["status"] == "ok":
            click.echo(f"Success: File uploaded to {name}({new_id})")
        else:
            click.echo(f"Error: {upload_res['message']}")
