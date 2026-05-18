#Requires -RunAsAdministrator
# mbExecutive - IIS Installation Script
# Run as Administrator FROM INSIDE the _deploy folder.
# See INSTALL.md for a plain-language guide.

$ErrorActionPreference = "Stop"

function Write-Step  { param($msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "    OK  $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "    WARN $msg" -ForegroundColor Yellow }
function Write-Fail  { param($msg) Write-Host "    ERR $msg" -ForegroundColor Red }
function Write-Banner {
    param($msg)
    $line = "=" * 60
    Write-Host "`n$line" -ForegroundColor White
    Write-Host "  $msg" -ForegroundColor White
    Write-Host "$line`n" -ForegroundColor White
}

# ==============================================================
# DEFAULTS (no prompts needed for these)
# ==============================================================

# The script lives inside the _deploy folder - IIS serves from here directly.
$InstallDir  = $PSScriptRoot
$SiteName    = "mb-executive"
$AppPoolName = "mb-executive"

# Auto-pick a free port starting from 80
function Find-FreePort {
    # Load WebAdministration so we can read existing IIS bindings
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    $usedPorts = @()
    try {
        $usedPorts = (Get-WebBinding -ErrorAction SilentlyContinue |
            ForEach-Object { ($_.bindingInformation -split ':')[1] } |
            Where-Object { $_ -match '^\d+$' } |
            ForEach-Object { [int]$_ })
    } catch {}

    foreach ($p in @(80, 8080, 8081, 8082, 8090)) {
        if ($p -notin $usedPorts) { return $p }
    }
    return 9000
}

$Port = Find-FreePort

# ==============================================================
# PROMPTS (only what cannot be defaulted)
# ==============================================================
Write-Banner "mbExecutive Installer"

Write-Host "  App folder : $InstallDir" -ForegroundColor DarkGray
Write-Host "  IIS Site   : $SiteName" -ForegroundColor DarkGray
Write-Host "  Port       : $Port (first free from 80, 8080, 8081...)" -ForegroundColor DarkGray
Write-Host ""

$IpAddress = Read-Host "IP address to bind (* = all interfaces, or enter a specific IP) [*]"
$IpAddress = $IpAddress.Trim()
if ([string]::IsNullOrWhiteSpace($IpAddress)) { $IpAddress = "*" }

Write-Host ""
Write-Host "  -- SQL Server connection --" -ForegroundColor White
$SqlServer   = Read-Host "SQL Server hostname or IP (e.g. 192.168.1.10 or SERVER\SQLEXPRESS)"
$SqlDatabase = Read-Host "Database name [Omega25]"
if ([string]::IsNullOrWhiteSpace($SqlDatabase)) { $SqlDatabase = "Omega25" }
$SqlUser     = Read-Host "SQL login username [sa]"
if ([string]::IsNullOrWhiteSpace($SqlUser)) { $SqlUser = "sa" }
$SqlPassword = Read-Host "SQL login password" -AsSecureString
$SqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SqlPassword)
)

$ConnString = "Data Source=$SqlServer;Initial Catalog=$SqlDatabase;User ID=$SqlUser;Password=$SqlPasswordPlain;"

Write-Host ""
Write-Host "  Summary:" -ForegroundColor White
Write-Host "    App folder  : $InstallDir"
Write-Host "    IIS Site    : $SiteName"
Write-Host "    Binding     : ${IpAddress}:${Port}"
Write-Host "    SQL Server  : $SqlServer"
Write-Host "    Database    : $SqlDatabase"
Write-Host "    SQL User    : $SqlUser"
Write-Host ""

$confirm = Read-Host "Proceed? [Y/N]"
if ($confirm -notmatch '^[Yy]') {
    Write-Warn "Cancelled."
    exit 0
}

# ==============================================================
# STEP 1 - Enable IIS Windows Features
# ==============================================================
Write-Step "Enabling IIS Windows features..."

$isServer = (Get-WmiObject Win32_OperatingSystem).Caption -match "Server"

if ($isServer) {
    # Windows Server
    $features = @(
        "Web-Server",
        "Web-WebServer",
        "Web-Common-Http",
        "Web-Default-Doc",
        "Web-Static-Content",
        "Web-Http-Errors",
        "Web-Http-Redirect",
        "Web-Health",
        "Web-Http-Logging",
        "Web-Performance",
        "Web-Stat-Compression",
        "Web-Security",
        "Web-Filtering",
        "Web-App-Dev",
        "Web-Net-Ext45",
        "Web-Asp-Net45",
        "Web-ISAPI-Ext",
        "Web-ISAPI-Filter",
        "Web-Mgmt-Tools",
        "Web-Mgmt-Console",
        "NET-Framework-45-ASPNET"
    )
    foreach ($f in $features) {
        $state = (Get-WindowsFeature -Name $f -ErrorAction SilentlyContinue).InstallState
        if ($state -ne "Installed") {
            Install-WindowsFeature -Name $f -IncludeManagementTools -ErrorAction SilentlyContinue | Out-Null
            Write-Ok "Installed feature: $f"
        } else {
            Write-Ok "Already installed: $f"
        }
    }
} else {
    # Windows 10/11 Desktop
    $features = @(
        "IIS-WebServerRole",
        "IIS-WebServer",
        "IIS-CommonHttpFeatures",
        "IIS-DefaultDocument",
        "IIS-StaticContent",
        "IIS-HttpErrors",
        "IIS-HttpRedirect",
        "IIS-HealthAndDiagnostics",
        "IIS-HttpLogging",
        "IIS-Performance",
        "IIS-HttpCompressionStatic",
        "IIS-Security",
        "IIS-RequestFiltering",
        "IIS-ApplicationDevelopment",
        "IIS-NetFxExtensibility45",
        "IIS-ASPNET45",
        "IIS-ISAPIExtensions",
        "IIS-ISAPIFilter",
        "IIS-ManagementConsole",
        "NetFx4Extended-ASPNET45"
    )
    foreach ($f in $features) {
        $state = (Get-WindowsOptionalFeature -Online -FeatureName $f -ErrorAction SilentlyContinue).State
        if ($state -ne "Enabled") {
            Enable-WindowsOptionalFeature -Online -FeatureName $f -All -NoRestart -ErrorAction SilentlyContinue | Out-Null
            Write-Ok "Enabled feature: $f"
        } else {
            Write-Ok "Already enabled: $f"
        }
    }
}

# ==============================================================
# STEP 2 - Register ASP.NET 4.x with IIS (safe to run multiple times)
# ==============================================================
Write-Step "Registering ASP.NET 4.x with IIS..."

$aspnetRegiis = "$env:windir\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe"
if (Test-Path $aspnetRegiis) {
    & $aspnetRegiis -iru 2>&1 | Out-Null
    Write-Ok "aspnet_regiis -iru completed."
} else {
    Write-Warn "aspnet_regiis.exe not found - .NET 4 may not be installed. Install .NET Framework 4.7.2 and rerun."
}

# ==============================================================
# STEP 3 - Install URL Rewrite 2.1 (required for Angular routing)
# ==============================================================
Write-Step "Checking URL Rewrite module..."

$rewriteDll = "$env:windir\System32\inetsrv\rewrite.dll"
if (Test-Path $rewriteDll) {
    Write-Ok "URL Rewrite module already installed."
} else {
    Write-Host "    Downloading URL Rewrite 2.1..." -ForegroundColor DarkGray
    $rwInstaller = "$env:TEMP\rewrite_amd64.msi"
    $rwUrl = "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi"
    try {
        Invoke-WebRequest -Uri $rwUrl -OutFile $rwInstaller -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$rwInstaller`" /qn" -Wait
        Write-Ok "URL Rewrite 2.1 installed."
    } catch {
        Write-Warn "Could not auto-install URL Rewrite. Download manually from:"
        Write-Warn "  https://www.iis.net/downloads/microsoft/url-rewrite"
        Write-Warn "Install it, then run iisreset and rerun this script."
    }
}

# ==============================================================
# STEP 4 - Patch Web.config (connection string + CORS)
# ==============================================================
Write-Step "Patching Web.config..."

# Script runs from inside the _deploy folder - Web.config is right here.
$webConfigPath = Join-Path $InstallDir "Web.config"
if (-not (Test-Path $webConfigPath)) {
    Write-Fail "Web.config not found at $webConfigPath - check your deploy source."
    exit 1
}

[xml]$cfg = Get-Content $webConfigPath -Encoding UTF8

# --- Connection string ---
$csNode = $cfg.configuration.connectionStrings.add | Where-Object { $_.name -eq "cstring" }
if ($csNode) {
    $csNode.connectionString = $ConnString
    Write-Ok "Connection string updated."
} else {
    Write-Warn "Connection string node 'cstring' not found in Web.config. Add it manually."
}

# --- CORS origins (empty = same-origin, no CORS needed) ---
$corsNode = $cfg.configuration.appSettings.add | Where-Object { $_.key -eq "corsOrigins" }
if ($corsNode) {
    $corsNode.value = ""
    Write-Ok "corsOrigins cleared (same-origin deployment - no CORS needed)."
} else {
    Write-Warn "corsOrigins key not found in Web.config appSettings."
}

$cfg.Save($webConfigPath)
Write-Ok "Web.config saved."

# ==============================================================
# STEP 6 - Create IIS App Pool
# ==============================================================
Write-Step "Setting up IIS App Pool: $AppPoolName ..."

Import-Module WebAdministration -ErrorAction Stop

if (Test-Path "IIS:\AppPools\$AppPoolName") {
    Write-Ok "App pool '$AppPoolName' already exists."
} else {
    New-WebAppPool -Name $AppPoolName | Out-Null
    Write-Ok "App pool '$AppPoolName' created."
}

# Configure pool: .NET 4, Integrated pipeline, always running
Set-ItemProperty "IIS:\AppPools\$AppPoolName" managedRuntimeVersion "v4.0"
Set-ItemProperty "IIS:\AppPools\$AppPoolName" managedPipelineMode   "Integrated"
Set-ItemProperty "IIS:\AppPools\$AppPoolName" startMode             "AlwaysRunning"
Write-Ok "App pool configured (.NET 4, Integrated, AlwaysRunning)."

# ==============================================================
# STEP 7 - Create IIS Website
# ==============================================================
Write-Step "Setting up IIS Website: $SiteName ..."

$bindingInfo = "${IpAddress}:${Port}:"

$existingSite = Get-Website -Name $SiteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Write-Warn "Site '$SiteName' already exists. Updating physical path and binding."
    Set-ItemProperty "IIS:\Sites\$SiteName" physicalPath $InstallDir
    # Remove old bindings and add the correct one
    Get-WebBinding -Name $SiteName | Remove-WebBinding
    New-WebBinding -Name $SiteName -Protocol http -IPAddress $IpAddress -Port $Port -HostHeader ""
} else {
    New-Website -Name $SiteName `
                -PhysicalPath $InstallDir `
                -ApplicationPool $AppPoolName `
                -IPAddress $IpAddress `
                -Port $Port | Out-Null
    Write-Ok "Website '$SiteName' created."
}

Set-ItemProperty "IIS:\Sites\$SiteName" applicationPool $AppPoolName
Write-Ok "Website bound to ${IpAddress}:${Port}."

# ==============================================================
# STEP 8 - Set folder permissions
# ==============================================================
Write-Step "Setting folder permissions..."

$acl = Get-Acl $InstallDir
$iisUser = "IIS AppPool\$AppPoolName"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $iisUser,
    "ReadAndExecute",
    "ContainerInherit,ObjectInherit",
    "None",
    "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl -Path $InstallDir -AclObject $acl
Write-Ok "Read+Execute granted to '$iisUser'."

# ==============================================================
# STEP 9 - Open firewall port
# ==============================================================
Write-Step "Opening firewall port $Port ..."

$ruleName = "mbExecutive - HTTP Port $Port"
$existingFwRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existingFwRule) {
    Write-Ok "Firewall rule already exists: '$ruleName'."
} else {
    New-NetFirewallRule `
        -DisplayName $ruleName `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $Port `
        -Action Allow | Out-Null
    Write-Ok "Firewall rule created for port $Port."
}

# ==============================================================
# STEP 10 - Restart IIS
# ==============================================================
Write-Step "Restarting IIS..."
iisreset /restart | Out-Null
Write-Ok "IIS restarted."

# ==============================================================
# DONE
# ==============================================================
Write-Banner "Installation complete!"
Write-Host "  Site     : $SiteName" -ForegroundColor White
Write-Host "  URL      : http://${IpAddress}:${Port}" -ForegroundColor White
Write-Host "  Files    : $InstallDir" -ForegroundColor White
Write-Host "  App Pool : $AppPoolName (.NET 4, Integrated)" -ForegroundColor White
Write-Host ""
Write-Host "  IMPORTANT - Manual step required:" -ForegroundColor Yellow
Write-Host "    Install SAP Crystal Reports runtime (v13.x, .NET 4, 64-bit)." -ForegroundColor Yellow
Write-Host "    Without it, any report page will crash the app pool." -ForegroundColor Yellow
Write-Host "    Download: https://www.sap.com/cmp/syb/crv/index.epx" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Open a browser and navigate to: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""
