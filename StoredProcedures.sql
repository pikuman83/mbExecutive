/*
================================================================================
  mbExecutive - Web stored procedures
================================================================================
  Replaces the inline ad-hoc SQL that used to live in the Web API controllers:

    * Auth\ValidateUser.cs        -> web_GetLoginUsers
    * Controllers\PostController  -> web_UpdateLoginPassword
    * Controllers\ReportsController (dropdown / lookup data):
          product    -> web_GetProducts
          raw        -> web_GetRawProducts
          customers  -> web_GetParties
          suppliers  -> web_GetParties
          Cash       -> web_GetCashAccounts
          account    -> web_GetLedgerAccounts
          location   -> web_GetLocations
          mgrp       -> web_GetMGroups
          grp        -> web_GetGroups
          pgroup     -> web_GetPGroups
          city       -> web_GetCities

  Compatible with very old SQL Server versions (SQL Server 2000 and later):
    * Existence test uses dbo.sysobjects / OBJECTPROPERTY (no sys.procedures).
    * Each CREATE PROCEDURE is the first statement in its own GO batch.
    * No CREATE OR ALTER, no TRY/CATCH, no MERGE - none exist on SQL 2000.

  Run this whole file once against the application database.
================================================================================
*/

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*------------------------------------------------------------------------------
  web_GetLoginUsers
  Returns the credentials so the API can validate the supplied user/password.
  (Faithful replacement for "Select * from Loginweb".)
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetLoginUsers]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetLoginUsers]
GO
CREATE PROCEDURE [dbo].[web_GetLoginUsers]
AS
BEGIN
    SELECT usernm, PASSWRD
    FROM Loginweb
END
GO

/*------------------------------------------------------------------------------
  web_UpdateLoginPassword
  Updates a user's password. (Replacement for the "update loginweb ..." query.)
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_UpdateLoginPassword]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_UpdateLoginPassword]
GO
CREATE PROCEDURE [dbo].[web_UpdateLoginPassword]
    @usernm  nvarchar(255),
    @PASSWRD nvarchar(255),
    @TYPE    nvarchar(50)
AS
BEGIN
    UPDATE loginweb
    SET usernm = @usernm,
        PASSWRD = @PASSWRD,
        TYPE = @TYPE
    WHERE usernm = @usernm
END
GO

/*------------------------------------------------------------------------------
  web_GetProducts        (table = "product")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetProducts]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetProducts]
GO
CREATE PROCEDURE [dbo].[web_GetProducts]
AS
BEGIN
    SELECT pcode, pname
    FROM product
END
GO

/*------------------------------------------------------------------------------
  web_GetRawProducts     (table = "raw")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetRawProducts]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetRawProducts]
GO
CREATE PROCEDURE [dbo].[web_GetRawProducts]
AS
BEGIN
    SELECT pcode, pname
    FROM product
    WHERE ptype = 0
END
GO

/*------------------------------------------------------------------------------
  web_GetParties         (table = "customers" or "suppliers")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetParties]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetParties]
GO
CREATE PROCEDURE [dbo].[web_GetParties]
AS
BEGIN
    SELECT vcode, vname, city
    FROM party
END
GO

/*------------------------------------------------------------------------------
  web_GetCashAccounts    (table = "Cash")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetCashAccounts]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetCashAccounts]
GO
CREATE PROCEDURE [dbo].[web_GetCashAccounts]
AS
BEGIN
    SELECT acode, aname
    FROM ACCOUNT
    WHERE [ATYPE] > 0
      AND [INTERF] <> 'STOCK'
      AND AStatus = 0
    ORDER BY aname, acode
END
GO

/*------------------------------------------------------------------------------
  web_GetLedgerAccounts  (table = "account")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetLedgerAccounts]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetLedgerAccounts]
GO
CREATE PROCEDURE [dbo].[web_GetLedgerAccounts]
AS
BEGIN
    SELECT ACode, AName
    FROM Account
    WHERE (AType > 0)
      AND (Levl = 4)
    ORDER BY AName, ACode
END
GO

/*------------------------------------------------------------------------------
  web_GetLocations       (table = "location")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetLocations]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetLocations]
GO
CREATE PROCEDURE [dbo].[web_GetLocations]
AS
BEGIN
    SELECT gname, gcode
    FROM location
END
GO

/*------------------------------------------------------------------------------
  web_GetMGroups         (table = "mgrp")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetMGroups]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetMGroups]
GO
CREATE PROCEDURE [dbo].[web_GetMGroups]
AS
BEGIN
    SELECT gname
    FROM mgrp
END
GO

/*------------------------------------------------------------------------------
  web_GetGroups          (table = "grp")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetGroups]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetGroups]
GO
CREATE PROCEDURE [dbo].[web_GetGroups]
AS
BEGIN
    SELECT gname
    FROM grp
END
GO

/*------------------------------------------------------------------------------
  web_GetPGroups         (table = "pgroup")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetPGroups]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetPGroups]
GO
CREATE PROCEDURE [dbo].[web_GetPGroups]
AS
BEGIN
    SELECT pgname
    FROM pgroup
END
GO

/*------------------------------------------------------------------------------
  web_GetCities          (table = "city")
------------------------------------------------------------------------------*/
IF EXISTS (SELECT * FROM dbo.sysobjects
           WHERE id = OBJECT_ID(N'[dbo].[web_GetCities]')
             AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
    DROP PROCEDURE [dbo].[web_GetCities]
GO
CREATE PROCEDURE [dbo].[web_GetCities]
AS
BEGIN
    SELECT cname
    FROM city
END
GO
