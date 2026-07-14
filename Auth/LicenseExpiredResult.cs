using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace mbExecutive.Auth
{
    public class LicenseExpiredResult : IHttpActionResult
    {
        public LicenseExpiredResult(HttpRequestMessage request)
        {
            Request = request;
        }

        public HttpRequestMessage Request { get; }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage((HttpStatusCode)402)
            {
                RequestMessage = Request,
                ReasonPhrase   = "License Expired"
            };
            return Task.FromResult(response);
        }
    }
}
