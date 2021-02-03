using System;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Web.Http;
using mbExecutive.Auth;

namespace mbExecutive.Controllers
{
    public class SPvaluesController : ApiController
    {
        [JwtAuthentication]
        public async Task<Double> GetCash(string sp, DateTime? datefrom, DateTime dateto)
        {
            string cs = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
            using (SqlConnection sql = new SqlConnection(cs))
            {
                using (SqlCommand cmd = new SqlCommand(sp, sql))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    if (datefrom != null) { 
                        cmd.Parameters.Add("@datefrom", SqlDbType.DateTime).Value = datefrom;
                        cmd.Parameters.Add("@dateto", SqlDbType.DateTime).Value = dateto;
                    }
                    else
                    {
                        cmd.Parameters.Add("@vdate", SqlDbType.DateTime).Value = dateto;
                    }
                    await sql.OpenAsync();
                    var value = await cmd.ExecuteScalarAsync();
                    return (Double)value;
                }
            }
        }
    }
}