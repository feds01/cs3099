import json
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
            new_token = refresh_res["token"]
            headers = {"Authorization": f"Bearer {new_token}"}
    except FileNotFoundError:
        pass

    return username, headers

def authenticated(func):
    @wraps(func)
    def wrapper(obj, *args, **kwargs):
        base_url = obj["BASE_URL"]
        auth_file = obj["CLI_PATH"] / "./config/auth.json"
        username, headers = get_auth(auth_file, base_url)
        if username is None or headers is None:
            print("Please login first")
            return

        kwargs["username"] = username
        kwargs["headers"] = headers
        return func(obj, *args, **kwargs)
    return wrapper