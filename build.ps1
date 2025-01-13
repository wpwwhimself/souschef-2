$newVersion = Read-Host "Enter new version tag"
$appJsonPath = "react\app.json"
$packageJsonPath = "react\package.json"

# update app.json
$appJson = Get-Content -Path $appJsonPath -Raw | ConvertFrom-Json
$appJson.expo.version = $newVersion
$appJson | ConvertTo-Json -Depth 100 | Set-Content -Path $appJsonPath

# update package.json
$packageJson = Get-Content -Path $packageJsonPath -Raw | ConvertFrom-Json
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 100 | Set-Content -Path $packageJsonPath

# build
Set-Location -Path "react"
npm run build-web
npm run build-android
