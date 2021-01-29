using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

namespace SsReports.Controllers
{
    [Route("api/mb/{id?}/{param1?}/{param2?}/{param3?}/{param4?}/{param5?}/{param6?}")]
    public class SsReportsController : ApiController
    {
        // GET: api/SsReports/?actions //i.e; api/SsReports/?id=SalesInv&formula=
        public IHttpActionResult Get(string id, string param1, string param2, string param3, string param4, string param5, string param6)
        {
            var location = System.Web.Hosting.HostingEnvironment.MapPath("~/" + id + ".rpt");
            ReportDocument reportDocument = new ReportDocument();
            reportDocument.Load(location);
            reportDocument.SetDatabaseLogon("sa", "Boogeyman123*");
            
            if (!string.IsNullOrEmpty(param1))
            {
                if (id == "SalesInv") { reportDocument.RecordSelectionFormula = "{ACCOUNT.ACODE} = '" + param1 + "' AND {ACCOUNT.ANAME} = '" + param2 + "' AND {ACCOUNT.AGNAME}= '" + param3 + "'"; }
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
