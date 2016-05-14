#!/usr/bin/python3
import os
import shutil

if not shutil.which("git"):
    print("Git is required.")

if not shutil.which("npm"):
    print("Nodejs >= 5 is required")

if not shutil.which("mongod"):
    print("Mongodb >= 3 is required")

if not (shutil.which("git") and shutil.which("npm") and shutil.which("mongod")):
    os.system.exit(1)


print("Starting update")
os.system("git pull")
os.system("git submodule foreach git pull origin master")
os.system("git submodule update --recursive --init")
os.chdir("files/frontend")
os.system("npm install")
os.system("npm run build-production")
os.chdir("../..")
os.system("npm install")
os.system("npm run build-production")
print("Finished update")
