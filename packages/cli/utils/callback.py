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


def file_to_str(value: str) -> str:
    """Custom validation function.

    It checks if a change log file of the given path(`value`) exists.

    Args:
        value (str): The path of the change log file specified by the user.

    Raises:
        click.BadParameter: Error raised if the given file path does not exist.

    Returns:
        str: Return the file content if it exists.
    """
    try:
        with open(value) as f:
            return f.read()
    except FileNotFoundError:
        raise click.BadParameter("File of the given path does not exist.")
    except Exception:
        raise click.BadParameter("File of the given path is malformed.")


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
