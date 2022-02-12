import os
import json
import unittest
from pathlib import Path
from commands.login import login
from click.testing import CliRunner


class LoginTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = Path(__file__).parent
        with open(cls.test_dir / "./config/test_config.json", "r") as f:
            cls.test_config = json.load(f)
        cls.auth_file = cls.test_dir / "./config/auth.json"
        cls.obj = {"CLI_PATH": cls.test_dir, "BASE_URL": cls.test_config["baseUrl"]}
        cls.runner = CliRunner()

    @classmethod
    def tearDownClass(cls):
        if cls.auth_file.exists():
            os.remove(cls.auth_file)

    def test_login_success(self):
        result = self.runner.invoke(
            login,
            [
                "--username",
                self.test_config["username"],
                "--password",
                self.test_config["password"],
            ],
            obj=self.obj,
        )
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.output, "Login successfully\n")
        self.assertTrue(self.auth_file.exists())

    def test_login_failure(self):
        result = self.runner.invoke(
            login, ["--username", "RANDOM", "--password", "RANDOM"], obj=self.obj
        )
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.output, "Login failed\n")


if __name__ == "__main__":
    unittest.main()