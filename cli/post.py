import os
import json
import click
import requests

dev_url = "http://localhost:5000"
prod_url = "https://cs3099user06.host.cs.st-andrews.ac.uk/api"

def get_auth():
    username = None
    headers = None

    try:
        with open(f"auth.json", "r") as f:
            data = json.load(f)
            token = data["token"]
            refreshToken = data["refreshToken"]
            username = data["username"]
            headers = {"Authorization": f"Bearer {token}"}
    except FileNotFoundError:
        click.echo("No token found. Please login first.")

    return username, headers

@click.group()
def cli():
    pass


@cli.command()
@click.option("--username", prompt="Username", help="Username", type=str)
@click.option("--password", prompt="Password", hide_input=True, help="Password", type=str)
@click.option("--prod", help="Use production server", is_flag=True)
def login(username, password, prod):
    base_url = prod_url if prod else dev_url
    login_body = {
        "username": username,
        "password": password
    }
    login_res = requests.post(f"{base_url}/auth/login", data=login_body).json()
    if login_res["status"] == "ok":
        data = {"username": username, "token": login_res["token"], "refreshToken": login_res["refreshToken"]}
        with open("auth.json", "w") as f:
            json.dump(data, f)
        click.echo("Login successful")
    else:
        click.echo("Login failed")

@cli.command()
@click.option("--prod", help="Use production server", is_flag=True)
def show(prod):
    base_url = prod_url if prod else dev_url
    username, headers = get_auth()
    if username is None or headers is None:
        return

    publications_res = requests.get(f"{base_url}/publication/{username}", headers=headers).json()
    if publications_res["status"] is True:
        publications = publications_res["data"]
        for pub in publications:
            print(f"{pub['title']} : {pub['id']}")
    else:
        print("No publications found")

@cli.command()
@click.option("--file", prompt="File Path", help="Path of the file to be uploaded", type=click.Path(exists=True))
@click.option("--publication", prompt="Publication ID", help="Publication ID", type=str)
@click.option("--prod", help="Use production server", is_flag=True)
def upload(file, publication, prod):
    base_url = prod_url if prod else dev_url
    username, headers = get_auth()
    if username is None or headers is None:
        return

    # TODO: A validator will be implemented in the future
    if not file.endswith(".zip"):
        click.echo("File must be a zip file")
        return

    upload_body = {"file": (file, open(file, "rb"), "application/zip")}
    upload_res = requests.post(f"{base_url}/resource/upload/publication/{publication}", files=upload_body, headers=headers)

    response = upload_res.json()
    if (response['status'] == "error"):
        click.echo(f"Error: {response['message']}")
    else:
        click.echo(f"Success: File uploaded to {publication}")

@cli.command()
def logout():
    try:
        os.remove("./auth.json")
        click.echo("Logout successfully")
    except FileNotFoundError:
        click.echo("You are not logged in")

if __name__ == "__main__":
    cli()
