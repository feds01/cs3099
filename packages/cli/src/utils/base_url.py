import sys
import json
import click
import requests
from typing import Callable
from functools import wraps
from posixpath import join as urljoin


def pass_base_url(func: Callable) -> Callable:
    """Decorator for commands that send a request to the server.

    Checks if the base url of the server is reachable.

    Args:
        func (Callable): Function to be decorated.

    Returns:
        Callable: The original function.
    """

    @wraps(func)
    def wrapper(ctx: click.core.Context, *args, **kwargs):
        config_file = ctx.obj["CLI_PATH"] / "config/config.json"
        try:
            with open(config_file, "r") as f:
                config = json.load(f)
                ctx.obj["BASE_URL"] = config["baseUrl"]

            version_api = urljoin(ctx.obj["BASE_URL"], "version")
            requests.get(version_api)
        except FileNotFoundError:
            click.echo(
                "No config.json found. Please create one using `config` command."
            )
        except KeyError as e:
            click.echo(f"Config file is not valid. Missing key: {e}")
        except requests.exceptions.RequestException as e:
            click.echo(
                "Base URL is not reachable, you could use `config` command to reset it."
            )
        except Exception as e:
            click.echo(f"Unexpected error occurs: {e}")
        else:
            return func(ctx, *args, **kwargs)  # return if no error occurs

        sys.exit(1)

    return wrapper
