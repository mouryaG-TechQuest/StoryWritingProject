# PowerShell script to run backend dev and advise if mvn is missing
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $here

function Check-Command($cmd) {
    $which = Get-Command $cmd -ErrorAction SilentlyContinue
    return $which -ne $null
}

if (-not (Check-Command mvn)) {
    Write-Host "Maven (mvn) not found on PATH." -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  1) Install Maven: https://maven.apache.org/install.html" -ForegroundColor White
    Write-Host "  2) Use Docker Compose (requires Docker Desktop) to run the backend and MySQL:" -ForegroundColor White
    Write-Host "       docker compose up --build" -ForegroundColor Gray
    Write-Host "  3) Install Chocolatey and run: choco install maven -y" -ForegroundColor White
    Write-Host "Press Enter to continue and try using Docker Compose instead, or Ctrl+C to cancel." -ForegroundColor Gray
    Read-Host | Out-Null
    if (Check-Command docker) {
        Write-Host "Docker detected, attempting docker compose up --build..." -ForegroundColor Green
        docker compose up --build
    } else {
        Write-Host "Docker not detected. Please install Maven or Docker, then re-run this script." -ForegroundColor Red
    }
} else {
    Write-Host "Maven found. Starting backend with 'dev' profile (H2)" -ForegroundColor Green
    & mvn -Dspring-boot.run.profiles=dev spring-boot:run
}
