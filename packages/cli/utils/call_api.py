import click
import requests


def call_api(method: str, api_url: str, **kwargs) -> dict[str, object]:
    try:
        res = requests.request(method, api_url, **kwargs)
        return res.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error occurs when sending request: {e}")
        exit(1)
    except Exception as e:
        raise
