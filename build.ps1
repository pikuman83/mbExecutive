# .SYNOPSIS
#     mbExecutive — Build & Package Script

# .DESCRIPTION
#     Run this on the DEVELOPER machine (where Visual Studio and Node.js are installed).
#     It builds the backend and frontend, then merges everything into a single "_deploy" folder
#     that is ready to be copied to any client server.

#     REQUIREMENTS on this machine:
#       - Visual Studio 2019 or later  (provides MSBuild)
#       - Node.js + npm                (for Angular build)
#       - Angular CLI  (npm install -g @angular/cli)

#     OUTPUT:
#       _deploy\        <-- copy the contents of this folder to the client server

# .EXAMPLE
#     .\build.ps1


$ErrorActionPreference = "Stop"

$RepoRoot    = $PSScriptRoot
$DeployDir   = Join-Path $RepoRoot "_deploy"
$frontendDir = Join-Path $RepoRoot "ssreports"
$distDir     = Join-Path $frontendDir "dist\ssreports"

function Write-Step { param($msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "    ERR $msg" -ForegroundColor Red }

# ─────────────────────────────────────────────────────────────────
# 1. BUILD FRONTEND FIRST (Angular into its own dist folder)
#    Must happen before we create/clean _deploy so Angular's own
#    clean step cannot touch the deploy folder.
# ─────────────────────────────────────────────────────────────────
Write-Step "Building Angular frontend (ng build --prod)..."

if (-not (Test-Path $frontendDir)) {
    Write-Fail "Frontend folder not found: $frontendDir"
    exit 1
}

Push-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "    Running npm install..." -ForegroundColor DarkGray
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Fail "npm install failed."; Pop-Location; exit 1 }
}

# --output-path is explicit so it always goes to dist\ssreports regardless of angular.json edits
npx ng build --prod --output-path="dist/ssreports"
if ($LASTEXITCODE -ne 0) { Write-Fail "Angular build failed."; Pop-Location; exit 1 }

Pop-Location

if (-not (Test-Path $distDir)) {
    Write-Fail "Angular dist folder not found after build: $distDir"
    exit 1
}
Write-Ok "Angular built: $distDir"

# ─────────────────────────────────────────────────────────────────
# 2. FIND MSBUILD
# ─────────────────────────────────────────────────────────────────
Write-Step "Locating MSBuild..."

$msbuild = $null

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $vsPath = & $vswhere -latest -requires Microsoft.Component.MSBuild -property installationPath 2>$null
    if ($vsPath) {
        $candidate = Join-Path $vsPath "MSBuild\Current\Bin\MSBuild.exe"
        if (Test-Path $candidate) { $msbuild = $candidate }
    }
}

if (-not $msbuild) {
    $inPath = Get-Command msbuild -ErrorAction SilentlyContinue
    if ($inPath) { $msbuild = $inPath.Source }
}

if (-not $msbuild) {
    Write-Fail "MSBuild not found. Install Visual Studio with the 'ASP.NET and web development' workload."
    exit 1
}
Write-Ok "MSBuild: $msbuild"

# ─────────────────────────────────────────────────────────────────
# 3. BUILD BACKEND (publish to _deploy)
#    Clean _deploy only AFTER Angular is done — Angular can't touch it.
# ─────────────────────────────────────────────────────────────────
Write-Step "Building and publishing backend (.NET 4.7.2)..."

# Target the .csproj directly — targeting the .sln with DeployOnBuild triggers
# the MSDeploy zip package flow instead of a plain filesystem publish.
$csproj = Join-Path $RepoRoot "mbExecutive.csproj"
if (-not (Test-Path $csproj)) {
    Write-Fail "mbExecutive.csproj not found at: $csproj"
    exit 1
}

if (Test-Path $DeployDir) {
    Remove-Item $DeployDir -Recurse -Force
    Write-Ok "Cleaned old _deploy folder."
}
New-Item -ItemType Directory -Path $DeployDir | Out-Null

& $msbuild $csproj `
    /t:WebPublish `
    /p:Configuration=Release `
    /p:Platform="AnyCPU" `
    /p:WebPublishMethod=FileSystem `
    /p:publishUrl="$DeployDir" `
    /p:DeleteExistingFiles=False `
    /verbosity:minimal

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Backend build failed. Fix the errors above and try again."
    exit 1
}
Write-Ok "Backend published to: $DeployDir"

# ─────────────────────────────────────────────────────────────────
# 4. MERGE FRONTEND INTO DEPLOY FOLDER
# ─────────────────────────────────────────────────────────────────
Write-Step "Merging Angular files into deploy folder..."

# Angular files go to the root of _deploy alongside bin\ and Web.config.
# OWIN's UseFileServer (Startup.cs) serves them from the app root.
Copy-Item -Path "$distDir\*" -Destination $DeployDir -Recurse -Force
Write-Ok "Frontend merged into: $DeployDir"

# ─────────────────────────────────────────────────────────────────
# 4b. COPY DEPLOYMENT SUPPORT FILES (installer, docs, DB script)
#     These are not part of the .NET build output (WebPublish only emits
#     Content items), but the client package must contain them so the
#     server can be installed and the stored procedures created.
# ─────────────────────────────────────────────────────────────────
Write-Step "Copying deployment support files..."

$supportFiles = @(
    "install.ps1",              # IIS installer (run on the client server)
    "INSTALL.md",               # plain-language install guide
    "StoredProcedures.sql",     # stored procedures used by the Web API
    "frontend-db-mapping.md"    # reference: which API/SP backs each screen
)
foreach ($f in $supportFiles) {
    $src = Join-Path $RepoRoot $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $DeployDir -Force
        Write-Ok "Packaged: $f"
    } else {
        Write-Host "    (note) $f not found in repo root - skipped." -ForegroundColor DarkGray
    }
}

# Crystal Reports templates. CrController loads these from the app root via
# MapPath("~/{id}.rpt"), so every .rpt in the repo root must ship to _deploy root.
# Non-recursive on purpose - the reportsbckup\ copies are NOT shipped.
$rptFiles = Get-ChildItem -Path $RepoRoot -Filter *.rpt -File
if ($rptFiles) {
    Copy-Item -Path $rptFiles.FullName -Destination $DeployDir -Force
    Write-Ok ("Packaged: {0} Crystal Reports (*.rpt)" -f $rptFiles.Count)
} else {
    Write-Host "    (note) no *.rpt files found in repo root - reports will not work." -ForegroundColor DarkGray
}

# Ship the feature-flag file as a TEMPLATE only (app-config.default.json), never
# as the live app-config.json. install.ps1 seeds the live file from this template
# on first install. Because the package does NOT contain app-config.json itself,
# copying a fresh _deploy over an existing install will not overwrite a client's
# customized show/hide settings.
$pkgConfig      = Join-Path $DeployDir "app-config.json"
$templateConfig = Join-Path $DeployDir "app-config.default.json"
if (Test-Path $pkgConfig) {
    Move-Item -Path $pkgConfig -Destination $templateConfig -Force
    Write-Ok "Feature config packaged as template: app-config.default.json"
} else {
    Write-Host "    (note) app-config.json not found in build output - feature config template not packaged." -ForegroundColor DarkGray
}

# ─────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────
Write-Host @"

  Build complete!
  ───────────────────────────────────────────────
  Deploy folder : $DeployDir

  Contents:
    bin\          — backend DLLs
    *.rpt         — Crystal Reports templates
    Web.config    — app configuration
    Global.asax   — ASP.NET entry point
    index.html    — Angular app entry point
    *.js / assets — Angular bundles and assets
    app-config.default.json — feature show/hide template (install.ps1 seeds app-config.json)
    install.ps1 / INSTALL.md — IIS installer and guide
    StoredProcedures.sql     — DB stored procedures (install.ps1 runs this)
    frontend-db-mapping.md   — API/stored-procedure reference

  Next step:
    Copy the _deploy folder to the client's server,
    then run install.ps1 as Administrator on that server.
  ───────────────────────────────────────────────
"@ -ForegroundColor Green
