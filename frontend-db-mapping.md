# Frontend to Database Mapping

**Database**: Omega25 (SQL Server)
**Backend**: ASP.NET 4.7.2 Web API
**Frontend**: Angular (TypeScript)

---

## 1. Login

**DB**: SP `web_GetLoginUsers` (`SELECT usernm, PASSWRD FROM Loginweb`)

---

## 2. Change Password

**DB**: SP `web_UpdateLoginPassword` (`UPDATE loginweb SET usernm=@usernm, PASSWRD=@PASSWRD, TYPE=@TYPE WHERE usernm=@usernm`)

---

## 3. Dashboard Metrics

### Single-value KPIs

| Dashboard Card | Stored Procedure |
|----------------|-----------------|
| Cash | `cash` |
| Bank Balance | `bbalance` |
| Receivable | `receivable` |
| Payable | `payable` |
| Sale Amount | `saleamount` |
| Sale Recovery | `salerecovery` |
| Cash Sale | `cashSale` |
| Credit Sale | `creditSale` |
| PDC Cheques | `pdcCheques` |

### Chart Data

| Dashboard Chart | Stored Procedure |
|----------------|-----------------|
| Top 10 Products | `SLTOP10` |
| Top 10 Sale Orders | `SOTOP10` |
| Sales | `sales` |
| Sale Orders | `saleorder` |
| Production | `production` |
| Expenses | `expenses` |

---

## 4. Dropdown / Lookup Data

| Parameter | Stored Procedure | SQL | Used By |
|-----------|------------------|-----|---------|
| `product` | `web_GetProducts` | `SELECT pcode, pname FROM product` | Multiple reports |
| `raw` | `web_GetRawProducts` | `SELECT pcode, pname FROM product WHERE ptype = 0` | PO Status Product-wise |
| `customers` | `web_GetParties` | `SELECT vcode, vname, city FROM party` | Recovery, Ledger, PDC |
| `suppliers` | `web_GetParties` | `SELECT vcode, vname, city FROM party` | Ledger, PO Status |
| `Cash` | `web_GetCashAccounts` | `SELECT acode, aname FROM ACCOUNT WHERE AType>0 AND INTERF<>'STOCK' AND AStatus=0` | Ledger reports |
| `account` | `web_GetLedgerAccounts` | `SELECT ACode, AName FROM Account WHERE AType>0 AND Levl=4` | Ledger reports |
| `location` | `web_GetLocations` | `SELECT gname, gcode FROM location` | Stock reports, Product Ledger |
| `mgrp` | `web_GetMGroups` | `SELECT gname FROM mgrp` | Periodic reports, PO Status |
| `grp` | `web_GetGroups` | `SELECT gname FROM grp` | Sale vs Production |
| `pgroup` | `web_GetPGroups` | `SELECT pgname FROM pgroup` | Multiple reports |
| `city` | `web_GetCities` | `SELECT cname FROM city` | Receivable, Sale vs Recovery |

---

## 5. Crystal Reports — PDF Generation

### Periodic Sales / Purchase / GRN

| Report ID | Description |
|-----------|-------------|
| `SaleRepPartyWise` / `SaleRepPartyWiseSumm` | Periodic Sale — party-wise |
| `SaleRepPrdWise` / `SaleRepPrdWiseSumm` | Periodic Sale — product-wise |
| `SaleRepInvWise` / `SaleRepInvWiseSumm` | Periodic Sale — invoice-wise |
| `PurRepPartyWise` / `PurRepPartyWiseSumm` | Periodic Purchase — party-wise |
| `PurRepPrdWise` / `PurRepPrdWiseSumm` | Periodic Purchase — product-wise |
| `PurRepInvWise` / `PurRepInvWiseSumm` | Periodic Purchase — invoice-wise |
| `GRNRepPartyWise` / `GRNRepPartyWiseSumm` | Periodic GRN — party-wise |
| `GRNRepPrdWise` / `GRNRepPrdWiseSumm` | Periodic GRN — product-wise |
| `GRNRepInvWise` / `GRNRepInvWiseSumm` | Periodic GRN — invoice-wise |

**DB Tables**: STOCK, PRODUCT, PARTY

### Ledger Reports

| Report ID | Description |
|-----------|-------------|
| `Lgrrep` | Account Ledger |
| `CustLgr` | Customer Ledger |
| `CustLgrWdChq` | Customer Ledger with Cheques |
| `SuppLgr` | Supplier Ledger |
| `Cash` | Cash Ledger |

### Accounts Receivable / Payable

| Report ID | Description |
|-----------|-------------|
| `PrtBalRep` | Customer/Supplier Balance |
| `PrtBalRepSumm` | Balance Summary |

**DB Tables**: PARTY, GNRLLGR

### Stock Balance

| Report ID | Description |
|-----------|-------------|
| `PrdBal` | Stock Balance |
| `PrdBal_Color` | Stock Balance — colour-wise |
| `Prdbal1_Color` | Stock Balance — alternate colour |
| `STKAmnt` | Stock Amount |

**DB Tables**: STOCK, PRODUCT

### Product Ledger

| Report ID | Description |
|-----------|-------------|
| `StkLgr` | Product / Stock Ledger |

**DB Tables**: STOCK, PRODUCT

### Recovery & Payment

| Report ID | Description |
|-----------|-------------|
| `PaymentReport` | Payments |
| `RecoveryReport` | Recovery |
| `RecoveryReportParty` | Recovery by Party |

### PDC Cheques

| Report ID | Description |
|-----------|-------------|
| `PdcChqRep` | Post-Dated Cheque Report |

### Sale vs Production

| Report ID | Stored Procedure | Description |
|-----------|-----------------|-------------|
| `SALVSPRDTN` | `SALVSPRDTN_SP` | Compares sales output vs production input by product group |

**DB Tables**: STOCK, PRODUCT

### Sale vs Recovery

| Report ID | Stored Procedure | Description |
|-----------|-----------------|-------------|
| `SALVSREC` | `SALVSREC_SP` | Compares sales debit vs recovery credit by party |

**DB Tables**: GNRLLGR, PARTY

### Sale / Purchase Order Status

| Report ID | Description |
|-----------|-------------|
| `SORptNew` | Sale Order Status — party-wise |
| `PORptNew` | Purchase Order Status — party-wise |
| `SOPrdRptNew` | Sale Order Status — product-wise |
| `POPrdRptNew` | Purchase Order Status — product-wise |

### Miscellaneous

| Report ID | Description |
|-----------|-------------|
| `Dllog` | Cash Book / Daily Log (single date) |
| `ExpRpt` | Expense Report (date range) |
| `zakat` | Zakat Report (date range) |

### Fast Sales Summary

| Report ID | Description |
|-----------|-------------|
| `FastSaleSumm` | Fast Sales Summary |

---

## Core Database Tables

| Table | Purpose |
|-------|---------|
| `ACCOUNT` | Chart of Accounts |
| `PARTY` | Customers & Suppliers |
| `PRODUCT` | Products (pcode, pname, ptype) |
| `STOCK` | Stock / Transaction Log |
| `GNRLLGR` | General Ledger |
| `LOGINWEB` | User authentication |

---

## All Stored Procedures

| Stored Procedure | Called By |
|-----------------|-----------|
| `cash` | Dashboard — Cash card |
| `bbalance` | Dashboard — Bank Balance card |
| `receivable` | Dashboard — Receivable card |
| `payable` | Dashboard — Payable card |
| `saleamount` | Dashboard — Sale Amount card |
| `salerecovery` | Dashboard — Sale Recovery card |
| `cashSale` | Dashboard — Cash Sale card |
| `creditSale` | Dashboard — Credit Sale card |
| `pdcCheques` | Dashboard — PDC Cheques card |
| `SLTOP10` | Dashboard — Top 10 Products chart |
| `SOTOP10` | Dashboard — Top 10 Sale Orders chart |
| `sales` | Dashboard — Sales chart |
| `saleorder` | Dashboard — Sale Order chart |
| `production` | Dashboard — Production chart |
| `expenses` | Dashboard — Expenses chart |
| `SALVSPRDTN_SP` | Sale vs Production report |
| `SALVSREC_SP` | Sale vs Recovery report |
| `web_GetLoginUsers` | Login validation |
| `web_UpdateLoginPassword` | Change password |
| `web_GetProducts` | Dropdown — products |
| `web_GetRawProducts` | Dropdown — raw products |
| `web_GetParties` | Dropdown — customers / suppliers |
| `web_GetCashAccounts` | Dropdown — cash accounts |
| `web_GetLedgerAccounts` | Dropdown — ledger accounts |
| `web_GetLocations` | Dropdown — locations |
| `web_GetMGroups` | Dropdown — main groups |
| `web_GetGroups` | Dropdown — groups |
| `web_GetPGroups` | Dropdown — product groups |
| `web_GetCities` | Dropdown — cities |
