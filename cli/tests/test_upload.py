import os
import json
import unittest
from pathlib import Path
from click.testing import CliRunner

from utils.auth import get_auth

from commands.upload import upload
from commands.login import login


class UploadTest(unittest.TestCase):
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

    # def test_upload(self):
    #     publication_id = "<ID>"
    #     file = "<FILE>"
    #     result = self.runner.invoke(
    #         upload,
    #         ["--file", file, "--publication", publication_id],
    #         obj=self.obj,
    #     )
    #     self.assertEqual(result.exit_code, 0)
    #     self.assertTrue(
    #         result.output == f"Success: File uploaded to {publication_id}\n"
    #         or result.output.startswith(f"Error: ")
    #     )
    
if __name__ == "__main__":
    unittest.main()