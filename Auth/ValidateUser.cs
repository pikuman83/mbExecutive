using mbExecutive.Controllers;
using System.Data.SqlClient;

namespace mbExecutive.Auth
{
    public class ValidateUser
    {
        public bool IsValidUser(Users user)
        {
            string cs = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
            using (SqlConnection sql = new SqlConnection(cs))
            {
                using (SqlCommand cmd = new SqlCommand("web_GetLoginUsers", sql))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    bool response = false;
                    sql.Open();

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            if (reader["usernm"].ToString() == user.username && reader["PASSWRD"].ToString() == user.password)
                            {
                                response = true;
                                break;
                            }
                        }
                    }
                    return response;
                }
            }
        }
    }
}