using mbExecutive.Auth;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Web.Http;

namespace mbExecutive.Controllers
{
    public class SPController : ApiController
    {
        [JwtAuthentication]
        public async Task<List<myClass>> GetSLSTOP1_Result1(string sp, string datefrom, string dateto)
        {
            string cs  = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString; 
            using (SqlConnection sql = new SqlConnection(cs))
            {
                using (SqlCommand cmd = new SqlCommand(sp, sql))
                {
                    if (datefrom != "null" || datefrom != null) cmd.Parameters.Add(new SqlParameter("@datefrom", DateTime.Parse(datefrom)));
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@dateto", DateTime.Parse(dateto)));
                    var response = new List<myClass>();
                    await sql.OpenAsync();

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            response.Add(CreateTable(reader));
                        }
                    }
                    return response;
                }
            }   
        }
        private myClass CreateTable(SqlDataReader reader)
        {
            return new myClass()
            {
                QTY = (Double)reader["QTY"],
                PNAME = reader["PNAME"].ToString(),
            };
        }
        public class myClass
        {
            public Nullable<double> QTY { get; set; }
            public string PNAME { get; set; }
        }
    }
}