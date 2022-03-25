import click
import requests


def call_api(method: str, api_url: str, **kwargs) -> dict[str, object]:
    """Call the API with the specified method and url.

    Used as a common method for all the API calls. It sends the request and
    deals with request exceptions such as connection errors.

    Args:
        method (str): The HTTP method of the request.
        api_url (str): The url of the API.

    Returns:
        dict[str, object]: The response of the API in JSON format if the request
            is successful.
    """
    try:
        res = requests.request(method, api_url, **kwargs)
        return res.json()
    except requests.exceptions.RequestException as e:
        click.echo(f"Error occurs when sending request: {e}")
        exit(1)
    except Exception as e:
        raise
