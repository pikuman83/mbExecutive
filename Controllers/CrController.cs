using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using mbExecutive.Auth;

namespace SsReports.Controllers
{
    //[JwtAuthentication]

    [Route("api/mb/{id?}/{param1?}/{param2?}/{param3?}/{param4?}/{param5?}/{param6?}/{param7?}")]
    public class SsReportsController : ApiController
    {
        // GET: api/SsReports/?actions //i.e; api/SsReports/?id=SalesInv&formula=
        public IHttpActionResult Get(string id, string param1, string param2, string param3, string param4, string param5, string param6, string param7)
        {
            var location = System.Web.Hosting.HostingEnvironment.MapPath("~/" + id + ".rpt");
            ReportDocument reportDocument = new ReportDocument();
            reportDocument.Load(location);
            reportDocument.SetParameterValue("@DT", param1);
            reportDocument.SetDatabaseLogon("sa", "");
            if (id == "PrtBalRep" && !string.IsNullOrEmpty(param2) || !string.IsNullOrEmpty(param3) || !string.IsNullOrEmpty(param4))
            {
                if (string.IsNullOrEmpty(param2)) reportDocument.RecordSelectionFormula = "ucase({PARTY.PGNAME}) = '" + param3 + "' AND ucase({PARTY.CITY}) = '" + param4 + "'";
                if (string.IsNullOrEmpty(param3)) reportDocument.RecordSelectionFormula = "ucase({PARTY.MGNAME}) = '" + param2 + "' AND ucase({PARTY.CITY}) = '" + param4 + "'";
                if (string.IsNullOrEmpty(param4)) reportDocument.RecordSelectionFormula = "ucase({PARTY.MGNAME}) = '" + param2 + "' AND ucase({PARTY.PGNAME}) = '" + param3 + "'";
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