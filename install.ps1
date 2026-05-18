<#
.SYNOPSIS
    mbExecutive IIS Installation Script

.DESCRIPTION
    Installs mbExecutive (ASP.NET Web API + Angular frontend) on IIS (Windows 10/11 or Windows Server).

    PREREQUISITES — prepare these before running:
      1. Backend build  : Publish the VS project using "FolderProfile" (Release → Folder).
                          Output goes to C:\Users\Usuario\Documents\mbExecutiveBuild by default,
                          or wherever you configured the publish profile.
      2. Frontend build : Inside the "ssreports\" folder, run:
                              npm install
                              npx ng build --prod
                          Output goes to ssreports\dist\ssreports\
      3. Crystal Reports runtime for .NET 4.0 must be installed on the server (see checklist at end).

    WHAT THIS SCRIPT DOES:
      - Enables IIS + ASP.NET 4.5 Windows features
      - Creates an IIS Application Pool (.NET v4.0, Integrated pipeline)
      - Creates an IIS Website bound to the chosen IP:port
      - Copies backend (API) and frontend (Angular) files into a single folder
      - Updates Web.config with your connection string
      - Sets folder permissions for the IIS app pool identity

    Run this script as Administrator.

.EXAMPLE
    .\install.ps1

.NOTES
    For multiple clients: run this script once per client, using a different SiteName,
    port, and install path each time. Only the connection string differs per client.
#>

#Requires -RunAsAdministrator
#Requires -Version 5.1
$ErrorActionPreference = "Stop"

# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────

function Write-Step { param($msg) Write-Host "`n[*] $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "    [!]  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "    [X]  $msg" -ForegroundColor Red }

function Read-Prompt {
    param([string]$Prompt, [string]$Default = "")
    $hint = if ($Default) { " [$Default]" } else { "" }
    $val  = Read-Host "$Prompt$hint"
    if ([string]::IsNullOrWhiteSpace($val) -and $Default) { return $Default }
    return $val
}

function Read-SecurePrompt {
    param([string]$Prompt)
    $secure = Read-Host -AsSecureString $Prompt
    $ptr    = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try   { return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Grant-FolderPermission {
    param([string]$Path, [string]$Identity, [string]$Rights)
    $acl  = Get-Acl -Path $Path
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        $Identity, $Rights,
        [System.Security.AccessControl.InheritanceFlags]"ContainerInherit,ObjectInherit",
        [System.Security.AccessControl.PropagationFlags]::None,
        [System.Security.AccessControl.AccessControlType]::Allow
    )
    $acl.SetAccessRule($rule)
    Set-Acl -Path $Path -AclObject $acl
    Write-Ok "Granted '$Rights' to '$Identity'"
}

# ─────────────────────────────────────────────────────────────────
# DETECT OS
# ─────────────────────────────────────────────────────────────────

$osCaption = (Get-WmiObject Win32_OperatingSystem).Caption
$isServer  = $osCaption -match "Server"
Write-Host "`nDetected OS: $osCaption" -ForegroundColor DarkGray

# ─────────────────────────────────────────────────────────────────
# GATHER INPUTS
# ─────────────────────────────────────────────────────────────────

Write-Host @"

  ╔══════════════════════════════════════════════╗
  ║       mbExecutive  –  IIS Installer          ║
  ╚══════════════════════════════════════════════╝
"@ -ForegroundColor White

# ── Artifact locations ────────────────────────
Write-Host "── Step 1/6 : Artifact Locations ──────────────────────" -ForegroundColor Yellow
Write-Host "   The backend publish folder contains bin\, *.rpt, Web.config, Global.asax, etc."
Write-Host "   The frontend dist folder contains index.html, *.js, assets\, etc."

$BackendSrc = Read-Prompt "Backend publish folder"
if (-not (Test-Path $BackendSrc)) {
    Write-Fail "Backend source folder not found: $BackendSrc"
    exit 1
}

$defaultFrontend = Join-Path (Split-Path $BackendSrc -Parent) "ssreports\dist\ssreports"
$FrontendSrc = Read-Prompt "Angular dist folder (ssreports\dist\ssreports)" $defaultFrontend

if (-not (Test-Path $FrontendSrc)) {
    Write-Warn "Frontend folder not found: $FrontendSrc"
    Write-Warn "You can copy the Angular files manually after this script finishes."
    $FrontendSrc = $null
}

# ── Target ────────────────────────────────────
Write-Host "`n── Step 2/6 : Install Target ──────────────────────────" -ForegroundColor Yellow

$InstallPath = Read-Prompt "Install folder on this server" "C:\inetpub\wwwroot\mbExecutive"
$SiteName    = Read-Prompt "IIS Site name" "mbExecutive"
$AppPoolName = $SiteName
$SitePort    = Read-Prompt "HTTP port" "80"
$SiteIP      = Read-Prompt "IP address to bind (* = all interfaces)" "*"

# ── Database connection ───────────────────────
Write-Host "`n── Step 3/6 : SQL Server Connection ───────────────────" -ForegroundColor Yellow
Write-Host "   The SQL Server must be reachable from this machine."

$DbServer   = Read-Prompt "SQL Server hostname or IP"
$DbName     = Read-Prompt "Database name" "Omega25"
$DbUser     = Read-Prompt "SQL login username" "sa"
$DbPassword = Read-SecurePrompt "SQL login password"

$ConnectionString = "data source=$DbServer;initial catalog=$DbName;persist security info=True;user id=$DbUser;password=$DbPassword"

# ── Confirm ───────────────────────────────────
Write-Host @"

── Review ──────────────────────────────────────
  Backend src  : $BackendSrc
  Frontend src : $(if ($FrontendSrc) { $FrontendSrc } else { '(skip — copy manually)' })
  Install path : $InstallPath
  IIS site     : $SiteName  (App Pool: $AppPoolName)
  Binding      : $SiteIP`:$SitePort
  DB server    : $DbServer
  DB name      : $DbName
  DB user      : $DbUser
  DB password  : ****
─────────────────────────────────────────────────
"@ -ForegroundColor White

$confirm = Read-Host "Proceed? (Y/n)"
if ($confirm -and $confirm -notmatch '^[Yy]$') {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# ─────────────────────────────────────────────────────────────────
# STEP 4 — ENABLE WINDOWS FEATURES (IIS + ASP.NET)
# ─────────────────────────────────────────────────────────────────

Write-Step "Step 4/6 : Enabling IIS and ASP.NET 4.5 Windows features..."

# Windows 10/11 / non-server uses Enable-WindowsOptionalFeature
$desktopFeatures = @(
    "IIS-WebServerRole",
    "IIS-WebServer",
    "IIS-CommonHttpFeatures",
    "IIS-HttpErrors",
    "IIS-StaticContent",
    "IIS-DefaultDocument",
    "IIS-ApplicationDevelopment",
    "IIS-ASPNET45",
    "IIS-NetFxExtensibility45",
    "IIS-ISAPIExtensions",
    "IIS-ISAPIFilter",
    "IIS-ManagementConsole"
)

# Windows Server uses Install-WindowsFeature (Server Manager module)
$serverFeatures = @(
    "Web-Server",
    "Web-WebServer",
    "Web-Common-Http",
    "Web-Static-Content",
    "Web-Default-Doc",
    "Web-Http-Errors",
    "Web-App-Dev",
    "Web-Asp-Net45",
    "Web-Net-Ext45",
    "Web-ISAPI-Ext",
    "Web-ISAPI-Filter",
    "Web-Mgmt-Console",
    "Web-Mgmt-Tools"
)

$needsReboot = $false

if ($isServer) {
    Write-Warn "Windows Server detected — using Install-WindowsFeature..."
    $result = Install-WindowsFeature -Name $serverFeatures -IncludeManagementTools
    if ($result.RestartNeeded -eq "Yes") { $needsReboot = $true }
    Write-Ok "Server features installed."
} else {
    foreach ($feature in $desktopFeatures) {
        $f = Get-WindowsOptionalFeature -Online -FeatureName $feature -ErrorAction SilentlyContinue
        if ($null -eq $f) {
            Write-Warn "Feature not found on this OS: $feature"
            continue
        }
        if ($f.State -ne "Enabled") {
            $r = Enable-WindowsOptionalFeature -Online -FeatureName $feature -NoRestart -ErrorAction SilentlyContinue
            if ($r.RestartNeeded) { $needsReboot = $true }
            Write-Ok "Enabled: $feature"
        } else {
            Write-Ok "Already enabled: $feature"
        }
    }
}

if ($needsReboot) {
    Write-Warn "A REBOOT IS REQUIRED to finish enabling IIS features."
    Write-Warn "Please reboot and run this script again."
    Read-Host "Press Enter to exit"
    exit 0
}

# Register ASP.NET 4.x with IIS (idempotent — safe to run multiple times)
Write-Step "Registering ASP.NET 4.x with IIS..."
$regiis = "$env:windir\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe"
if (Test-Path $regiis) {
    & $regiis -iru 2>&1 | Out-Null
    Write-Ok "aspnet_regiis -iru completed."
} else {
    Write-Warn ".NET Framework 4.x (64-bit) not found at expected path."
    Write-Warn "Ensure .NET Framework 4.7.2 is installed: https://dotnet.microsoft.com/download/dotnet-framework/net472"
}

# ─────────────────────────────────────────────────────────────────
# STEP 5 — DEPLOY FILES
# ─────────────────────────────────────────────────────────────────

Write-Step "Step 5/6 : Deploying files to $InstallPath ..."

if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Ok "Created install folder."
} else {
    Write-Warn "Install folder already exists — existing files will be overwritten."
}

# Copy backend (preserves bin\ subfolder structure)
Write-Host "    Copying backend files..." -ForegroundColor DarkGray
Copy-Item -Path "$BackendSrc\*" -Destination $InstallPath -Recurse -Force
Write-Ok "Backend files copied."

# Copy Angular frontend (flat into root — index.html, *.js, assets\, etc.)
if ($FrontendSrc) {
    Write-Host "    Copying Angular frontend files..." -ForegroundColor DarkGray
    Copy-Item -Path "$FrontendSrc\*" -Destination $InstallPath -Recurse -Force
    Write-Ok "Frontend files copied."
} else {
    Write-Warn "Frontend source not provided — copy the contents of ssreports\dist\ssreports\ into $InstallPath manually."
}

# ── Update Web.config in deployed folder ──────
Write-Host "    Patching Web.config..." -ForegroundColor DarkGray
$webConfigPath = Join-Path $InstallPath "Web.config"

if (-not (Test-Path $webConfigPath)) {
    Write-Fail "Web.config not found in install folder — did the backend copy succeed?"
    exit 1
}

[xml]$cfg = Get-Content $webConfigPath -Encoding UTF8

# Connection string
$csNode = $cfg.configuration.connectionStrings.add | Where-Object { $_.name -eq "cstring" }
if ($csNode) {
    $csNode.connectionString = $ConnectionString
    Write-Ok "Connection string updated."
} else {
    Write-Warn "'cstring' connection string not found in Web.config — update it manually."
}

# corsOrigins — clear it; frontend and backend share the same IIS site (same origin)
$corsNode = $cfg.configuration.appSettings.add | Where-Object { $_.key -eq "corsOrigins" }
if ($corsNode) {
    $corsNode.value = ""
    Write-Ok "corsOrigins cleared (same-origin deployment — no CORS needed)."
}

# Disable debug compilation in production
$compilation = $cfg.configuration."system.web".compilation
if ($compilation) {
    $compilation.SetAttribute("debug", "false")
    Write-Ok "debug=false set in Web.config."
}

$cfg.Save($webConfigPath)
Write-Ok "Web.config saved."

# ─────────────────────────────────────────────────────────────────
# STEP 6 — CONFIGURE IIS
# ─────────────────────────────────────────────────────────────────

Write-Step "Step 6/6 : Configuring IIS..."

Import-Module WebAdministration -ErrorAction Stop

# ── App Pool ──────────────────────────────────
if (Test-Path "IIS:\AppPools\$AppPoolName") {
    Write-Warn "App pool '$AppPoolName' already exists — skipping creation."
} else {
    New-WebAppPool -Name $AppPoolName | Out-Null
    Write-Ok "App pool '$AppPoolName' created."
}
# Ensure correct settings regardless of whether it was just created
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedRuntimeVersion -Value "v4.0"
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedPipelineMode    -Value "Integrated"
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name startMode               -Value "AlwaysRunning"
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name processModel.idleTimeout -Value ([TimeSpan]::Zero)
Write-Ok "App pool configured: .NET v4.0, Integrated, AlwaysRunning."

# ── Website ───────────────────────────────────
$existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Write-Warn "Website '$SiteName' already exists — updating physical path."
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath    -Value $InstallPath
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $AppPoolName
} else {
    New-Website -Name $SiteName -PhysicalPath $InstallPath -ApplicationPool $AppPoolName -Port $SitePort | Out-Null
    Write-Ok "Website '$SiteName' created on port $SitePort."

    # If a specific IP was given (not wildcard), update the binding
    if ($SiteIP -ne "*") {
        $binding = Get-WebBinding -Name $SiteName
        if ($binding) {
            Set-WebBinding -Name $SiteName `
                -BindingInformation "*:${SitePort}:" `
                -PropertyName bindingInformation `
                -Value "${SiteIP}:${SitePort}:"
            Write-Ok "Binding updated to $SiteIP`:$SitePort."
        }
    }
}

# ── Permissions ───────────────────────────────
Write-Host "    Setting folder permissions..." -ForegroundColor DarkGray

$appPoolIdentity = "IIS AppPool\$AppPoolName"

# Read+Execute on install root (for DLLs, RPTs, static files)
Grant-FolderPermission $InstallPath $appPoolIdentity "ReadAndExecute"
Grant-FolderPermission $InstallPath "IIS_IUSRS"      "ReadAndExecute"

# Modify on a writable subfolder for Crystal Reports temp output and any logs
$writablePath = Join-Path $InstallPath "App_Data"
if (-not (Test-Path $writablePath)) {
    New-Item -ItemType Directory -Path $writablePath -Force | Out-Null
}
Grant-FolderPermission $writablePath $appPoolIdentity "Modify"
Grant-FolderPermission $writablePath "NETWORK SERVICE" "Modify"

# Crystal Reports writes temp files to %TEMP% and the app directory
# Grant Modify on the app root so Crystal can write its cache files
Grant-FolderPermission $InstallPath $appPoolIdentity "Modify"

Write-Ok "Permissions configured."

# ── Firewall ─────────────────────────────────
Write-Host "    Configuring Windows Firewall..." -ForegroundColor DarkGray
$ruleName = "mbExecutive HTTP $SitePort"
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $existingRule) {
    New-NetFirewallRule `
        -DisplayName $ruleName `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $SitePort `
        -Action Allow | Out-Null
    Write-Ok "Firewall rule added: allow TCP port $SitePort inbound."
} else {
    Write-Ok "Firewall rule already exists for port $SitePort."
}

# ── Start everything ──────────────────────────
Start-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
Start-Website    -Name $SiteName    -ErrorAction SilentlyContinue
Write-Ok "Site and app pool started."

# ─────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────

$displayIP = if ($SiteIP -eq "*") { "localhost" } else { $SiteIP }

Write-Host @"

  ╔══════════════════════════════════════════════════════╗
  ║           Installation Complete!                     ║
  ╚══════════════════════════════════════════════════════╝

  App URL  :  http://$displayIP`:$SitePort/
  API test :  http://$displayIP`:$SitePort/api/RequestToken  (POST)

  ─── Post-installation checklist ─────────────────────────

  [ ] SAP Crystal Reports runtime for .NET 4.0 (v13.x) must be installed.
      Without this, any report endpoint will crash the app pool.
      Download from SAP: https://www.sap.com/cmp/syb/crv/index.epx
      (Search: "SAP Crystal Reports, version for Visual Studio")

  [ ] Verify SQL connectivity from this server:
        sqlcmd -S $DbServer -d $DbName -U $DbUser -Q "SELECT 1"

  [ ] If clients access via the machine's IP from another PC, confirm
      the firewall rule is active (port $SitePort was opened above).

  [ ] IIS Manager (optional GUI): Start > inetmgr

  [ ] For multiple clients: re-run this script with a different
      SiteName, port, and install path. Only the connection string differs.

  ─────────────────────────────────────────────────────────
"@ -ForegroundColor Green
