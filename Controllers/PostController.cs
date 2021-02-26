using mbExecutive.Auth;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mbExecutive.Controllers
{
    public class PostController : ApiController
    {
       
        public HttpResponseMessage Post([FromBody] string[] value)
        {
            var user = new Users
            {
                username = value[0],
                password = value[1]
            };
            if (CheckUser(user))
            {
                string cs = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
                using (SqlConnection sql = new SqlConnection(cs))
                {
                    string query = "update loginweb set usernm=@usernm,PASSWRD=@PASSWRD,TYPE=@TYPE where usernm=@usernm";
                    using (SqlCommand cmd = new SqlCommand(query, sql))
                    {
                        cmd.Parameters.AddWithValue("@usernm", value[0]);
                        cmd.Parameters.AddWithValue("@PASSWRD", value[2]);
                        cmd.Parameters.AddWithValue("@TYPE", "0");
                        sql.Open();
                        cmd.ExecuteNonQuery();
                        sql.Close();
                    }
                    return Request.CreateResponse(HttpStatusCode.OK);
                }
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized,
             "Invalid Password");
            }
        }

        private bool CheckUser(Users users)
        {
            ValidateUser validate = new ValidateUser();
            if (validate.IsValidUser(users))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
