using mbExecutive.Auth;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mbExecutive.Controllers
{
    public class RequestTokenController : ApiController
    {
        public HttpResponseMessage Post(Users user)
        {
            if (!LicenseValidator.IsLicenseValid())
                return Request.CreateResponse((HttpStatusCode)402, "License Expired");

            if (CheckUser(user))
            {
                LicenseValidator.TriggerPhoneHomeAsync();
                return Request.CreateResponse(HttpStatusCode.OK,
             JwtAuthManager.GenerateJWTToken(user.username));
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized,
             "Invalid Request");
            }
        }

        private bool CheckUser(Users users)
        {
            ValidateUser validate = new ValidateUser();
            return validate.IsValidUser(users);
        }
    }
    public class Users
    {
        public string username { get; set; }
        public string password { get; set; }
    }
}