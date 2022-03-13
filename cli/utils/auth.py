import json
import click
import pathlib
import requests
from functools import wraps
from typing import Tuple


def get_auth(auth_file: pathlib.PosixPath, base_url: str) -> Tuple[str, dict[str, str]]:
    username, headers = None, None
    try:
        with open(auth_file, "r") as f:
            data = json.load(f)
            username = data.pop("username")

            # refresh the token
            refresh_res = requests.post(f"{base_url}/auth/session", data=data).json()
            new_token, new_refresh_token = (
                refresh_res["token"],
                refresh_res["refreshToken"],
            )
            headers = {"Authorization": f"Bearer {new_token}"}
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
        print("Auth file not found")
    except KeyError:
        print("Refresh token expired")

    return username, headers


def authenticated(func):
    @wraps(func)
    def wrapper(ctx: click.core.Context, *args, **kwargs):
        base_url = ctx.obj["BASE_URL"]
        auth_file = ctx.obj["CLI_PATH"] / "./config/auth.json"
        username, headers = get_auth(auth_file, base_url)
        if username is None or headers is None:
            print("Please login first")
            return

        kwargs["username"] = username
        kwargs["headers"] = headers
        return func(ctx, *args, **kwargs)

    return wrapper
