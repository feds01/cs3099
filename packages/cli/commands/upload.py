import click
from urllib.parse import urljoin

from utils.call_api import call_api
from utils.auth import authenticated
from utils.base_url import pass_base_url
from utils.publication import get_id_name
from utils.mutually_exclusive_options import MutuallyExclusiveOptions
from utils.callback import callback_wrapper, zipfile_validator, file_to_str

from commands.revise import revise


def call_upload_api(
    base_url: str, pub_id: str, name: str, file: str, headers: dict[str, str]
) -> dict[str, object]:
    """Call the upload API to upload a zipfile to the server.

    Args:
        base_url (str): The base URL of the server.
        pub_id (str): The id of the publication to be uploaded.
        name (str): The name of the publication to be uploaded.
        file (str): The path of the zipfile which is to be uploaded.
        headers (dict[str, str]): The headers obtained from the auth file, which
            contains token for sending the request.

    Returns:
        dict[str, object]: The response of the upload API in JSON format, it is
            returned only when request fails.
    """
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
    callback=callback_wrapper(zipfile_validator),
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
@pass_base_url
@authenticated
def upload(
    ctx: click.core.Context,
    file: str,
    pub_id: str = None,
    name: str = None,
    username: str = None,
    headers: dict[str, str] = None,
) -> None:
    """CLI command for the user to upload a zipfile to a specified publication.

    Usage:
        $ iamus upload --file <file> --id <id>
        or
        $ iamus upload --file <file> --name <name>

    Args:
        ctx (click.core.Context): Context object to share global variables with
            subcommands.
        file (str): The path of the zipfile specified by the user.
        pub_id (str, optional): The id of the publication specified by the user,
            it is required if `name` is not specified.
        name (str, optional): The name of the publication specified by the user,
            it is required if `pub_id` is not specified.
        username (str): The username obtained from the auth file.
        headers (dict[str, str]): The headers obtained from the auth file, which
            contains token for sending the request.
    """
    base_url = ctx.obj["BASE_URL"]

    pub_id, name = get_id_name(base_url, username, headers, pub_id, name)
    if not all([pub_id, name]):
        return

    # upload
    upload_res = call_upload_api(base_url, pub_id, name, file, headers)
    try:
        assert upload_res["errors"]["file"]["code"] == 100
    except KeyError:
        return
    except AssertionError:
        click.echo(f"Error: {upload_res['errors']['file']['message']}")
        return

    click.echo(upload_res['errors']['file']['message'])
    click.confirm("Do you want to upload it to a new revision?", abort=True)

    # revise
    revision = click.prompt("Revision number", type=str)
    changelog = click.prompt("Change log file path", type=str, value_proc=file_to_str)

    new_id = ctx.invoke(
        revise, pub_id=pub_id, name=name, revision=revision, changelog=changelog
    )
    if new_id is None:
        return

    # upload to the new publication
    call_upload_api(base_url, new_id, name, file, headers)
