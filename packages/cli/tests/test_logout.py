import os
import unittest
from pathlib import Path
from commands.logout import logout
from click.testing import CliRunner


class LogoutTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = Path(__file__).parent
        cls.obj = {"CLI_PATH": cls.test_dir}
        cls.runner = CliRunner()
        cls.dummy_auth_file = cls.test_dir / "./config/auth.json"

    def setUp(self):
        if self.dummy_auth_file.exists():
            os.remove(self.dummy_auth_file)

    def tearDown(self):
        if self.dummy_auth_file.exists():
            os.remove(self.dummy_auth_file)

    def test_logout_with_auth(self):
        with open(self.dummy_auth_file, "w") as f:
            f.write("{}")

        result = self.runner.invoke(logout, [], obj=self.obj)
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.output, "Logout successfully\n")

    def test_logout_without_auth(self):
        result = self.runner.invoke(logout, [], obj=self.obj)
        self.assertEqual(result.exit_code, 0)
        self.assertEqual(result.output, "You are not logged in\n")

if __name__ == '__main__':
    unittest.main()