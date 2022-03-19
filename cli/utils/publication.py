from typing import Tuple
from urllib.parse import urljoin
from .call_api import call_api


def get_id_name(
    base_url: str,
    username: str,
    headers: dict[str, str],
    pub_id: str = None,
    name: str = None,
) -> Tuple[str, str]:
    parameter = f"{username}/{name}" if name else f"{pub_id}"
    get_pub_api = urljoin(base_url, f"publication/{parameter}")

    try:
        get_pub_res = call_api("GET", get_pub_api, headers=headers)
        pub_id, name = get_pub_res["publication"]["id"], get_pub_res["publication"]["name"]
    except KeyError:
        print(f"Response Error: {get_pub_res['message']}")
    except Exception as e:
        print(f"Unexpected error occurs: {e}")
        exit(1)

    return pub_id, name
