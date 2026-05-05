$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    throw "Missing .env file. Create it from .env.example and add your Supabase values."
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
        return
    }

    $name, $value = $line -split "=", 2
    $name = $name.Trim()
    $value = $value.Trim().Trim('"').Trim("'")
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$intellijMaven = "C:\Program Files\JetBrains\IntelliJ IDEA 2023.3.3\plugins\maven\lib\maven3\bin\mvn.cmd"
$maven = if (Test-Path $intellijMaven) { $intellijMaven } else { "mvn" }
$repo = Join-Path $env:USERPROFILE ".m2\repository"

& $maven "-Dmaven.repo.local=$repo" spring-boot:run
