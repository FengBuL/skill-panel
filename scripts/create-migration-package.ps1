param(
  [switch]$SkipSkills
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$version = (Get-Content -LiteralPath (Join-Path $repoRoot "package.json") -Raw | ConvertFrom-Json).version
$migrationRoot = Join-Path $repoRoot "output\migration"
$packageRoot = Join-Path $migrationRoot "Skill-Panel-v$version"
$zipPath = Join-Path $migrationRoot "Skill-Panel-v$version-migration.zip"

if (-not $packageRoot.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to write outside the repository: $packageRoot"
}

if (Test-Path -LiteralPath $packageRoot) {
  Remove-Item -LiteralPath $packageRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path `
  (Join-Path $packageRoot "app"), `
  (Join-Path $packageRoot "portable"), `
  (Join-Path $packageRoot "config"), `
  (Join-Path $packageRoot "docs"), `
  (Join-Path $packageRoot "skills\.codex"), `
  (Join-Path $packageRoot "skills\.agents") | Out-Null

$installer = Join-Path $repoRoot "src-tauri\target\release\bundle\nsis\Skill Panel_$version`_x64-setup.exe"
$portableExe = Join-Path $repoRoot "src-tauri\target\release\skill-panel.exe"
$settings = Join-Path $env:USERPROFILE ".codex\skill-panel\settings.json"
$guide = Join-Path $repoRoot "docs\migration-guide-v2.md"

if (-not (Test-Path -LiteralPath $installer)) {
  throw "Missing installer. Run npm.cmd run tauri:build:windows first: $installer"
}

if (-not (Test-Path -LiteralPath $portableExe)) {
  throw "Missing portable executable. Run npm.cmd run tauri:build:windows first: $portableExe"
}

Copy-Item -LiteralPath $installer -Destination (Join-Path $packageRoot "app") -Force
Copy-Item -LiteralPath $portableExe -Destination (Join-Path $packageRoot "portable\skill-panel.exe") -Force
Copy-Item -LiteralPath $guide -Destination (Join-Path $packageRoot "README-MIGRATION.md") -Force
Copy-Item -LiteralPath $guide -Destination (Join-Path $packageRoot "docs\migration-guide-v2.md") -Force

if (Test-Path -LiteralPath $settings) {
  Copy-Item -LiteralPath $settings -Destination (Join-Path $packageRoot "config\settings.json") -Force
}

if (-not $SkipSkills) {
  $codexSkills = Join-Path $env:USERPROFILE ".codex\skills"
  $agentsSkills = Join-Path $env:USERPROFILE ".agents\skills"

  if (Test-Path -LiteralPath $codexSkills) {
    Copy-Item -LiteralPath $codexSkills -Destination (Join-Path $packageRoot "skills\.codex\skills") -Recurse -Force
  }

  if (Test-Path -LiteralPath $agentsSkills) {
    Copy-Item -LiteralPath $agentsSkills -Destination (Join-Path $packageRoot "skills\.agents\skills") -Recurse -Force
  }
}

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $packageRoot "*") -DestinationPath $zipPath -Force

Write-Output "Migration package: $zipPath"
