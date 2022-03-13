import requests
from typing import Tuple


def get_id_name(
    base_url: str,
    username: str,
    headers: dict[str, str],
    id_: str = None,
    name: str = None,
) -> Tuple[str, str]:
    if name:
        get_pub_api = f"{base_url}/publication/{username}/{name}"
    else:
        get_pub_api = f"{base_url}/publication/{id_}"
    try:
        get_pub_res = requests.get(get_pub_api, headers=headers).json()
        id_, name = get_pub_res["publication"]["id"], get_pub_res["publication"]["name"]
    except KeyError:
        print(f"Error: {get_pub_res['message']}")

    return id_, name
