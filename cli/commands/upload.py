import click
import requests
from utils.auth import authenticated
from zipfile import is_zipfile


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
@click.option("--publication", prompt="Publication ID", help="Publication ID", type=str)
@click.pass_obj
@authenticated
def upload(
    obj: dict[str, str],
    file: str,
    publication: str,
    username: str = None,
    headers: dict[str, str] = None,
) -> None:
    base_url = obj["BASE_URL"]

    upload_body = {"file": (file, open(file, "rb"), "application/zip")}
    upload_res = requests.post(
        f"{base_url}/resource/upload/publication/{publication}",
        files=upload_body,
        headers=headers,
    )

    response = upload_res.json()
    if response["status"] == "error":
        click.echo(f"Error: {response['message']}")
    else:
        click.echo(f"Success: File uploaded to {publication}")