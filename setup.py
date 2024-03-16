from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in raven/__init__.py
from raven import __version__ as version

setup(
	name="raven",
	version=version,
	description="Messaging Application",
	author="The Commit Company",
	author_email="support@thecommit.company",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires,
)
