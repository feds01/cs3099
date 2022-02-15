import json
import pathlib
import requests
from typing import Tuple

def get_auth(cli_path: pathlib.PosixPath, base_url: str) -> Tuple[str, dict[str, str]]:
    username, headers = None, None
    auth_file = cli_path / "./config/auth.json"
    try:
        with open(auth_file, "r") as f:
            data = json.load(f)
            username = data.pop("username")
          
            # refresh the token
            refresh_res = requests.post(f"{base_url}/auth/session", data=data).json()
            new_token = refresh_res["token"]
            headers = {"Authorization": f"Bearer {new_token}"}
    except FileNotFoundError:
        pass

    return username, headers