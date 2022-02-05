import os
import json
import click
import requests

base_url = "http://localhost:5000"

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
def login(username, password):
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
def show():
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
@click.option("--file", help="Path of the file to be uploaded", type=str, default=None)
@click.option("--publication", help="Publication ID", type=str, default=None)
def upload(file, publication):
    username, headers = get_auth()
    if username is None or headers is None:
        return
    
    if file is None:
        file = click.prompt("File path")
    if publication is None:
        publication = click.prompt("Publication ID")
        
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
