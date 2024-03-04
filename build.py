import json
import subprocess

new_version = input("Enter new version tag: ")
path_to_app_json = "react/app.json"
path_to_package_json = "react/package.json"

# update app.json
with open(path_to_app_json, "r") as file:
  data = json.load(file)

data["expo"]["version"] = new_version

with open(path_to_app_json, "w") as file:
  json.dump(data, file, indent = 2)

# update package.json
with open(path_to_package_json, "r") as file:
  data = json.load(file)

data["version"] = new_version

with open(path_to_package_json, "w") as file:
  json.dump(data, file, indent = 2)

# build
subprocess.run("cd react && npm run build-web && npm run build-android", shell = True)
