if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[SLVSPRDTN_SP]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [dbo].[SLVSPRDTN_SP]
GO

if exists (select * from dbo.sysobjects where id = object_id(N'[dbo].[SLVSREC_SP]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [dbo].[SLVSREC_SP]
GO

SET QUOTED_IDENTIFIER OFF 
GO
SET ANSI_NULLS OFF 
GO

CREATE PROCEDURE [dbo].[SLVSPRDTN_SP]
@datefrom datetime,
@dateto datetime,
@PGrp as nvarchar(100)

AS
if   @PGrp='All'
Begin
SELECT @datefrom,@dateto,Sal.PCODE,PRODUCT.PCODE,PRODUCT.PNAME, SUM(Sal.OUTQT) as SL,
    (SELECT SUM(Rec.INQT)
     FROM stock AS Rec
     WHERE Sal.PCODE = Rec.PCODE AND Rec.VDATE >=@datefrom AND Rec.VDATE <= @dateto AND Rec.JO IN('MPD','PD','PDN')) AS PRDTN
FROM STOCK AS Sal 
INNER JOIN PRODUCT ON Sal.PCODE = PRODUCT.PCODE AND PRODUCT.[PTYPE] =1 AND
Sal.VDATE >= @datefrom AND Sal.VDATE <= @dateto AND Sal.JO IN('GIN','SLC')
GROUP BY Sal.PCODE,PRODUCT.PCODE,PRODUCT.PNAME
ORDER By PRODUCT.PCODE;

End
else

Begin

SELECT @datefrom,@dateto,Sal.PCODE,PRODUCT.PCODE,PRODUCT.PNAME, SUM(Sal.OUTQT) as SL,
    (SELECT SUM(Rec.INQT)
     FROM stock AS Rec
     WHERE Sal.PCODE = Rec.PCODE AND Rec.VDATE >=@datefrom AND Rec.VDATE <= @dateto AND Rec.JO IN('MPD','PD','PDN')) AS PRDTN
FROM STOCK AS Sal 
INNER JOIN PRODUCT ON Sal.PCODE = PRODUCT.PCODE AND PRODUCT.[PTYPE] =1 AND
Sal.VDATE >= @datefrom AND Sal.VDATE <= @dateto AND Sal.JO IN('GIN','SLC') AND PRODUCT.GNAME=@PGrp
GROUP BY Sal.PCODE,PRODUCT.PCODE,PRODUCT.PNAME
ORDER By PRODUCT.PCODE;

End
GO
SET QUOTED_IDENTIFIER OFF 
GO
SET ANSI_NULLS ON 
GO

SET QUOTED_IDENTIFIER OFF 
GO
SET ANSI_NULLS OFF 
GO


CREATE PROCEDURE [dbo].[SLVSREC_SP]
@datefrom datetime,
@dateto datetime,
@PGrp nvarchar(100),
@City nvarchar(100)


AS

if   @PGrp='All' AND @City='All'
Begin
SELECT @datefrom,@dateto,Sal.ACODE,PARTY.VCODE,PARTY.VNAME, SUM(Sal.DEBIT) as SL,
    (SELECT SUM(Rec.CREDIT)
     FROM gnrllgr AS Rec
     WHERE Sal.ACODE = Rec.ACODE AND Rec.VDATE >=@datefrom AND Rec.VDATE <= @dateto) AS RCV
FROM gnrllgr AS Sal 
INNER JOIN PARTY ON Sal.ACODE = PARTY.VCODE AND PARTY.[ATYPE] =0 AND
Sal.VDATE >= @datefrom AND Sal.VDATE <= @dateto
GROUP BY Sal.ACODE,PARTY.VCODE,PARTY.VNAME
ORDER By PARTY.VCODE;

End

else if   @PGrp<>'All' AND @City='All'

Begin
SELECT @datefrom,@dateto,Sal.ACODE,PARTY.VCODE,PARTY.VNAME, SUM(Sal.DEBIT) as SL,
    (SELECT SUM(Rec.CREDIT)
     FROM gnrllgr AS Rec
     WHERE Sal.ACODE = Rec.ACODE AND Rec.VDATE >=@datefrom AND Rec.VDATE <= @dateto) AS RCV
FROM gnrllgr AS Sal 
INNER JOIN PARTY ON Sal.ACODE = PARTY.VCODE AND PARTY.[ATYPE] =0 AND
Sal.VDATE >= @datefrom AND Sal.VDATE <= @dateto AND PARTY.PGNAME=@PGrp
GROUP BY Sal.ACODE,PARTY.VCODE,PARTY.VNAME
ORDER By PARTY.VCODE;

End

else if   @PGrp='All' AND @City<>'All'

Begin
SELECT @datefrom,@dateto,Sal.ACODE,PARTY.VCODE,PARTY.VNAME, SUM(Sal.DEBIT) as SL,
    (SELECT SUM(Rec.CREDIT)
     FROM gnrllgr AS Rec
     WHERE Sal.ACODE = Rec.ACODE AND Rec.VDATE >=@datefrom AND Rec.VDATE <= @dateto) AS RCV
FROM gnrllgr AS Sal 
INNER JOIN PARTY ON Sal.ACODE = PARTY.VCODE AND PARTY.[ATYPE] =0 AND
Sal.VDATE >= @datefrom AND Sal.VDATE <= @dateto AND PARTY.CITY=@City
GROUP BY Sal.ACODE,PARTY.VCODE,PARTY.VNAME
ORDER By PARTY.VCODE;

End

else if   @PGrp<>'All' AND @City<>'All'

Begin
SELECT @datefrom,@dateto,Sal.ACODE,PARTY.VCODE,PARTY.VNAME, SUM(Sal.DEBIT) as SL,
    (SELECT SUM(Rec.CREDIT)
     FROM gnrllgr AS Rec
     WHERE Sal.ACODE = Rec.ACODE AND Rec.VDATE >=@datefrom AND Rec.VDATE <= @dateto) AS RCV
FROM gnrllgr AS Sal 
INNER JOIN PARTY ON Sal.ACODE = PARTY.VCODE AND PARTY.[ATYPE] =0 AND
Sal.VDATE >= @datefrom AND Sal.VDATE <= @dateto AND PARTY.PGNAME=@PGrp AND PARTY.CITY=@City
GROUP BY Sal.ACODE,PARTY.VCODE,PARTY.VNAME
ORDER By PARTY.VCODE;

End
GO
SET QUOTED_IDENTIFIER OFF 
GO
SET ANSI_NULLS ON 
GO

