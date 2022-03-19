import click
from .revise import revise
from zipfile import is_zipfile
from urllib.parse import urljoin
from utils.call_api import call_api
from utils.auth import authenticated
from utils.publication import get_id_name
from utils.mutually_exclusive_options import MutuallyExclusiveOptions


def validate_zipfile(
    ctx: click.core.Context, param: click.types.ParamType, value: str
) -> str:
    if not is_zipfile(value):
        raise click.BadParameter("File must be a zip file")
    return value


def call_upload_api(
    base_url: str, pub_id: str, file: str, headers: dict[str, str], name: str
):
    upload_api = urljoin(base_url, f"resource/upload/publication/{pub_id}")
    upload_body = {"file": (file, open(file, "rb"), "application/zip")}
    try:
        upload_res = call_api("POST", upload_api, files=upload_body, headers=headers)
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        exit(1)

    if upload_res["status"] == "ok":
        pub_url = urljoin(base_url, f"publication/{pub_id}")
        click.echo(f"Success: File uploaded to {name}({pub_url})")
        exit(0)

    click.echo(f"Response Error: {upload_res['message']}")
    return upload_res


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
def upload(
    ctx: click.core.Context,
    file: str,
    pub_id: str = None,
    name: str = None,
    username: str = None,
    headers: dict[str, str] = None,
) -> None:
    base_url = ctx.obj["BASE_URL"]

    pub_id, name = get_id_name(base_url, username, headers, pub_id, name)
    if not all([pub_id, name]):
        return

    # upload
    upload_res = call_upload_api(base_url, pub_id, file, headers, name)
    try:
        assert upload_res['errors']['file']['code'] == 100
    except KeyError:
        return
    except AssertionError:
        click.echo(f"Error: {upload_res['errors']['file']['message']}")
        return

    click.confirm("Do you want to upload it to a new revision?", abort=True)

    # revise
    revision = click.prompt("Revision number", type=str)
    changelog = click.prompt("Changelog", type=str)

    new_id = ctx.invoke(
        revise, pub_id=pub_id, name=name, revision=revision, changelog=changelog
    )
    if new_id is None:
        return

    # upload to the new publication
    call_upload_api(base_url, new_id, file, headers, name)
