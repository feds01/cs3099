from typing import Tuple
from urllib.parse import urljoin
from utils.call_api import call_api


def get_id_name(
    base_url: str,
    username: str,
    headers: dict[str, str],
    pub_id: str = None,
    name: str = None,
) -> Tuple[str, str]:
    """Get publication id and name from the server.

    It expects at least one of id or name not being None and return both id and
    name of the most recent publication.

    Args:
        base_url (str): The base URL of the server.
        username (str): The username obtained from the auth file.
        headers (dict[str, str]): The headers obtained from the auth file, which
            contains token for sending the request.
        pub_id (str, optional): The id of the publication specified by the user,
            it is required if `name` is not specified.
        name (str, optional): The name of the publication specified by the user,
            it is required if `pub_id` is not specified.

    Returns:
        Tuple[str, str]: _description_
    """
    parameter = f"{username}/{name}" if name else f"{pub_id}"
    get_pub_api = urljoin(base_url, f"publication/{parameter}")

    try:
        get_pub_res = call_api("GET", get_pub_api, headers=headers)
        pub_id, name = (
            get_pub_res["publication"]["id"],
            get_pub_res["publication"]["name"],
        )
    except KeyError:
        print(f"Response Error: {get_pub_res['message']}")
    except Exception as e:
        print(f"Unexpected error occurs: {e}")
        exit(1)

    return pub_id, name
