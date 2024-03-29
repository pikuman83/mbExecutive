﻿using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using mbExecutive.Auth;
using mbExecutive.Models;

namespace SsReports.Controllers
{
    [JwtAuthentication]

    [Route("api/mb/{id?}/{param1?}/{param2?}/{param3?}/{param4?}/{param5?}/{param6?}/{param7?}")]
    public class SsReportsController : ApiController
    {
        SF_PrtBal _sF = new SF_PrtBal();
        SF_Recovery _sF1 = new SF_Recovery();


        // GET: api/SsReports/?actions //i.e; api/SsReports/?id=SalesInv&formula=
        public IHttpActionResult Get(string id, string param1, string param2, string param3, string param4, string param5, string param6, string param7)
        {
            var location = System.Web.Hosting.HostingEnvironment.MapPath("~/" + id + ".rpt");
            ReportDocument reportDocument = new ReportDocument();
            reportDocument.Load(location);

            reportDocument.SetDatabaseLogon("sa", "");
            //reportDocument.SetDatabaseLogon("DB_A70E8A_mbdashboard_admin", "Boogeyman123*");

            //Cash Book
            if (id == "Dllog") { reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1)); }

            //Periodic Expense Report
            if (id == "PurRepInvWise" || id == "PurRepInvWiseSumm" || id == "PurRepPartyWise" || id == "PurRepPartyWiseSumm" || id == "PurRepPrdWise" || id == "PurRepPrdWiseSumm" || id == "SaleRepInvWise" || id == "SaleRepInvWiseSumm" || id == "SaleRepPartyWise" || id == "SaleRepPartyWiseSumm" || id == "SaleRepPrdWise" || id == "SaleRepPrdWiseSumm" || id == "GRNRepPrdWiseSumm" || id == "GRNRepPrdWise" || id == "GRNRepPartyWiseSumm" || id == "GRNRepPartyWise" || id == "GRNRepInvWiseSumm" || id == "GRNRepInvWise") 
            { 
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@vcode", param3);
                reportDocument.SetParameterValue("@mgrp", param4);
                reportDocument.SetParameterValue("@sgrp", param5);
                reportDocument.SetParameterValue("@gdcode", param6);
            }
            //Periodic Sale | Periodic Purchase | Zakat
            if (id == "ExpRpt" || id == "zakat")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
            }

            // CUSTOMER/SUPPLIER BALANCE REPORT
            if (id == "PrtBalRep" || id == "PrtBalRepSumm") { 
                reportDocument.SetParameterValue("@DT", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@ATYPE", param6);
                if (!string.IsNullOrEmpty(param3) || !string.IsNullOrEmpty(param4) || !string.IsNullOrEmpty(param5))
                {
                    reportDocument.RecordSelectionFormula = _sF.myFormula(param3, param4, param5);
                };
            }

            // Stock Balance | Stock Balance (ColorWise) | Stock Amount
            if (id == "PrdBal" || id == "STKAmnt" || id == "PrdBal_Color" || id == "Prdbal1_Color")
            {
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@Godown", param2);
                reportDocument.SetParameterValue("@PTYP", param3);
            }

            // ACCOUNT/CUSTOMER/SUPPLIER LEDGERS
            if (id == "Lgrrep" || id == "CustLgr" || id == "SuppLgr" || id == "Cash")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@acode", param3);
                if (id == "CustLgr" || id == "SuppLgr") { reportDocument.SetParameterValue("Pm-LGRREP.ACode", param3); }
            }

            //PAYMENT REPORT
            if (id == "PaymentReport" || id == "RecoveryReport" || id == "RecoveryReportParty")
            {
                reportDocument.SetParameterValue("@fdate", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@edate", DateTime.Parse(param2));
                if (id == "RecoveryReport" || id == "RecoveryReportParty")
                {
                    reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                    reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                }
                    if (!string.IsNullOrEmpty(param3) || !string.IsNullOrEmpty(param4) || !string.IsNullOrEmpty(param5))
                {
                    reportDocument.RecordSelectionFormula = _sF1.myFormula(param3, param4, param5);
                }
            }

            // PRODUCT LEDGER (Stock)
            if (id == "StkLgr")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@pcode", param3);
                reportDocument.SetParameterValue("@gcode", param4);
            }

            //Sale Vs Production / Sale Vs Recovery
            if (id == "SALVSPRDTN" || id == "SALVSREC")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@pgrp", param3);
                if (id == "SALVSREC")
                {
                    reportDocument.SetParameterValue("@City", param4);
                }
            }

            // Fast Sale Summary
            if (id == "FastSaleSumm")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@Tp", param3);
            }

            // Sale Order Status Party-wise
            if (id == "SORptNew" || id == "PORptNew")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@vcode", param3);
                reportDocument.SetParameterValue("@zbal", param4);
            }

            // Sale Order Status Product-wise
            if (id == "SOPrdRptNew" || id == "POPrdRptNew")
            {
                reportDocument.SetParameterValue("@datefrom", DateTime.Parse(param1));
                reportDocument.SetParameterValue("@dateto", DateTime.Parse(param2));
                reportDocument.SetParameterValue("@pcode", param3);
                reportDocument.SetParameterValue("@zbal", param4);
                if(param5 != "SELECT")
                {
                    reportDocument.RecordSelectionFormula = "ucase({PRODUCT.MGNAME}) = '" + param5 + "'";
                }
            }

            Stream s = reportDocument.ExportToStream(ExportFormatType.PortableDocFormat);
            s.Seek(0, SeekOrigin.Begin);
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StreamContent(s);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            return ResponseMessage(response);
        }
    }
}