import sys
import json
import click
import pathlib
from functools import wraps
from posixpath import join as urljoin
from typing import Tuple, Callable

from utils.call_api import call_api


def get_auth(auth_file: pathlib.PosixPath, base_url: str) -> Tuple[str, dict[str, str]]:
    """Get username and tokens from and update the specified auth file.

    Args:
        auth_file (pathlib.PosixPath): Path to the auth file.
        base_url (str): The base URL of the server.

    Returns:
        Tuple[str, dict[str, str]]: Returns username and headers.
    """
    username, headers = None, None
    try:
        with open(auth_file, "r") as f:
            data = json.load(f)
            username = data.pop("username")

        # refresh the token
        refresh_api = urljoin(base_url, "auth/session")
        refresh_res = call_api("POST", refresh_api, data=data)

        new_token, new_refresh_token = (
            refresh_res["token"],
            refresh_res["refreshToken"],
        )
        headers = {"Authorization": f"Bearer {new_token}"}

        # update the auth file
        with open(auth_file, "w") as f:
            json.dump(
                {
                    "username": username,
                    "token": new_token,
                    "refreshToken": new_refresh_token,
                },
                f,
            )
    except FileNotFoundError:
        click.echo("Auth file not found")
    except KeyError:
        click.echo("Refresh token expired")
    except Exception as e:
        click.echo(f"Unexpected error occurs: {e}")
        sys.exit(1)

    return username, headers


def authenticated(func: Callable) -> Callable:
    """Decorator for commands that require authentication.

    It calls `get_auth` to get username and headers from auth file and pass them
    to decorated functions.

    Args:
        func (Callable): Function to be decorated.

    Returns:
        Callable: Decorated function with additional arguments `username` and
            `headers`.
    """

    @wraps(func)
    def wrapper(ctx: click.core.Context, *args, **kwargs):
        base_url = ctx.obj["BASE_URL"]
        auth_file = ctx.obj["CLI_PATH"] / "config/auth.json"
        username, headers = get_auth(auth_file, base_url)
        if username is None or headers is None:
            click.echo("Please login first")
            return

        kwargs["username"] = username
        kwargs["headers"] = headers
        return func(ctx, *args, **kwargs)

    return wrapper
