# mbExecutive — Installer Guide

Quick guide for the person running the installation on the client's server.

---

## Before you start — what you need

1. **The `_deploy` folder** — produced by the developer running `build.ps1`.
   Copy this folder (with `install.ps1` inside it) to the server via USB, shared drive, etc.

2. **SQL Server details** — ask the client:
   - SQL Server IP or computer name (e.g. `192.168.1.10` or `DESKTOP-ABC\SQLEXPRESS`)
   - Database name (usually `Omega25` unless they renamed it)
   - SQL login username and password (usually `sa` + their password)

3. **IP address** — which IP the app should listen on.
   Use `*` if unsure (means "all network interfaces on this machine").

4. **Windows must have internet access** (script downloads one small component automatically).

> **Port**: the script picks port 80 automatically. If 80 is already in use by another site it tries 8080, 8081, etc.

---

## Installation steps

1. Copy the `_deploy` folder to the server. It already contains `install.ps1`.

2. Right-click PowerShell → **Run as Administrator**

3. Navigate into the `_deploy` folder:
   ```
   cd C:\path\to\_deploy
   ```

4. Run the installer:
   ```
   .\install.ps1
   ```

5. Answer the three prompts (IP address + SQL details — see table below)

6. When done, open a browser on the server and go to `http://localhost` (or the port shown at the end).
   You should see the login screen.

---

## Prompt reference

| Prompt | What to enter | Example |
| --- | --- | --- |
| IP address | `*` for all interfaces, or a specific IP | `*` |
| SQL Server hostname or IP | The database server | `192.168.1.10` |
| Database name | Press Enter for default `Omega25`, or type the name | `Omega25` |
| SQL login username | Press Enter for default `sa`, or type the user | `sa` |
| SQL login password | SQL password (won't show while typing) | *(type it)* |
| Proceed? | Confirm and start | `Y` |

---

## Multiple clients on the same server

The site name is fixed as `mb-executive` and the port is auto-selected. To install for a second client, rename the existing IIS site first (via IIS Manager), then run `install.ps1` again from the new client's `_deploy` folder.

---

## If something goes wrong

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Login button returns error | Wrong SQL connection string | Edit `Web.config` in the install folder, fix the `connectionString` value |
| Page shows 500 error on startup | Crystal Reports runtime not installed | See below |
| Navigating to `/Login` gives 404 | URL Rewrite module missing | Download from <https://www.iis.net/downloads/microsoft/url-rewrite> and install, then restart IIS (`iisreset`) |
| App not reachable from other computers | Firewall blocking the port | Script opens the port automatically; if still blocked, check Windows Defender Firewall |
| IIS won't start the app pool | .NET 4.7.2 not registered | Run as admin: `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\aspnet_regiis.exe -iru` |

---

## Crystal Reports — manual install required

The script **cannot** install this automatically (it requires a SAP account).

1. Go to: <https://www.sap.com/cmp/syb/crv/index.epx>
2. Search for: **SAP Crystal Reports runtime for Visual Studio** (version 13.x for .NET 4.0, 64-bit)
3. Install it on the server
4. Restart IIS: open Command Prompt as Admin and run `iisreset`

Without this, any report page will crash the app.

---

## Quick IIS management

- Open IIS Manager: Press `Win + R` → type `inetmgr` → Enter
- Restart IIS from command line (admin): `iisreset`
- Start/stop a site: IIS Manager → Sites → right-click the site
