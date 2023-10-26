# Iamus CLI

This is the command-line interface for Iamus. It allows a user to easily upload
the zip file of a specified publication to the Iamus, show all publications
the current user owns, and revise a specific publication.

Our production server is at [http://cs3099user06.host.cs.st-andrews.ac.uk/](http://cs3099user06.host.cs.st-andrews.ac.uk/).
## Usage

```bash
$ iamus <command> [<args>]
```

To start off, you could specify the base URL of the Iamus server if you don't want to use the default one:
```bash
$ iamus config --base-url <url>
```
This will create a directory ``config`` in the executable's directory if not already exist, as well as a file ``config/config.json``. 

Before you can use commands such as `upload`, `show`, and `revise`, you need to login into Iamus:
```bash
$ iamus login --username <username> --password <password>
```
This will create a token file ``config/auth.json``. You could use ``logout`` command to remove it.

All command parameters can either be passed from command-line, or from user input if not provided. The CLI supports a hidden password prompt, therefore it is recommended to login in the following way:
```bash
$ iamus login --username <username>
Password:
Login successfully
$ 
```

To find out more information, please use `help` option:
```bash
$ iamus --help
```
or to view help for a specific sub-command:
```bash
$ iamus <subcommand> --help
```
## Build executable on your machine

CD to the ``src`` directory where source code is located:
```bash
$ cd src
```

Then, you will need to install the required dependencies(under your virtual environment, or globally):

using [pip](https://pip.pypa.io/en/stable/):

```bash
$ pip install -r requirements.txt
```

using [conda](https://docs.conda.io/en/latest/):

```bash
$ conda install --file requirements.txt
```

using [pipenv](https://pipenv.pypa.io/en/latest/):

```bash
$ pipenv install
$ pipenv shell # enter virtual environment
```

Finally, use the following command to build the executable:
```bash
$ pyinstaller iamus.spec --distpath <output-path> --clean
```
You will find the executable under ``<output-path>/iamus`` directory.
