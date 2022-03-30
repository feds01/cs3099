import click
from functools import wraps
from zipfile import is_zipfile


def callback_wrapper(func):
    """Decorator function to wrap the callback function.

    Args:
        func (function): The function to be wrapped.

    Returns:
        function: The wrapped function discarding ctx and param.
    """

    @wraps(func)
    def wrapper(
        ctx: click.core.Context, param: click.types.ParamType, value: str
    ) -> str:
        try:
            return func(value)
        except Exception as e:
            raise e

    return wrapper


def url_validator(value: str) -> str:
    """Custom validation function. 
    
    It checks if a given url starts with http or https.

    Args:
        value (str): The base url of the server specified by the user.

    Raises:
        click.BadParameter: Error raised if the given url is malformed.

    Returns:
        str: Return the url if it passes the simple check.
    """
    if not value.startswith("http://") and not value.startswith("https://"):
        raise click.BadParameter("The url should start with http or https")
    return value


def changelog_editor(value: str) -> str:
    """Callback function to edit the change log in a given file.

    Args:
        value (str): The path of the change log file specified by the user. If
            its value is NOFILE the user can edit change log directly in an
            editor.

    Raises:
        click.BadParameter: Error raised if change log file is neither provided
            nor edited and saved.

    Returns:
        str: Return the changelog content.
    """
    if value == "DEFAULT":
        value = click.prompt("Change log file or edit directly", default="NOFILE")

    # file path is not provided, edit directly
    if value == "NOFILE":
        MARKER = "### Please edit the change log above this marker ###"
        changelog = click.edit("\n\n" + MARKER)
        if changelog is None:
            raise click.BadParameter("No change log provided.")
        changelog = changelog.split(MARKER, 1)[0].rstrip("\n")
    else:
        # file path is provided, edit the corresponding file
        click.edit(filename=value)
        try:
            with open(value) as f:
                changelog = f.read()
        except FileNotFoundError:
            raise click.BadParameter("No change log provided.")
        except Exception:
            raise click.BadParameter("File of the given path is malformed.")

    return changelog


def zipfile_validator(value: str) -> str:
    """Custom validation function. 
    
    It checks if a valid zipfile of the given path(`value`) exists.

    Args:
        value (str): The path of the zipfile specified by the user.

    Raises:
        click.BadParameter: Error raised if the given path is not a valid zipfile.

    Returns:
        str: Return the path if it is a valid zipfile.
    """
    if not is_zipfile(value):
        raise click.BadParameter("File must be a zip file")
    return value
