import os
import json
import unittest
from pathlib import Path
from click.testing import CliRunner

from utils.auth import get_auth

from commands.show import show
from commands.login import login


class ShowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = Path(__file__).parent
        with open(cls.test_dir / "./config/test_config.json", "r") as f:
            cls.test_config = json.load(f)
        cls.auth_file = cls.test_dir / "./config/auth.json"
        cls.obj = {"CLI_PATH": cls.test_dir, "BASE_URL": cls.test_config["baseUrl"]}
        cls.runner = CliRunner()

        # Login to get token file
        login_result = cls.runner.invoke(
            login,
            [
                "--username",
                cls.test_config["username"],
                "--password",
                cls.test_config["password"],
            ],
            obj=cls.obj,
        )
        assert login_result.exit_code == 0

    @classmethod
    def tearDownClass(cls):
        if cls.auth_file.exists():
            os.remove(cls.auth_file)

    def test_show(self):
        result = self.runner.invoke(show, [], obj=self.obj)
        self.assertEqual(result.exit_code, 0)
        self.assertTrue(
            result.output.startswith("Listing all publications available:\n")
            or result.output == "No publications found\n"
        )


if __name__ == "__main__":
    unittest.main()
