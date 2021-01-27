using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Web.Http;
//using mbExecutive.Models;

namespace mbExecutive.Controllers
{
    public class SPController : ApiController
    {        
        public async Task<List<SLTOP1>> GetSLSTOP1_Result1(string sp, DateTime datefrom, DateTime dateto)
        {
            string cs  = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString; 
            using (SqlConnection sql = new SqlConnection(cs))
            {
                using (SqlCommand cmd = new SqlCommand(sp, sql))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.Add(new SqlParameter("@datefrom", datefrom));
                    cmd.Parameters.Add(new SqlParameter("@dateto", dateto));
                    var response = new List<SLTOP1>();
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
        private  SLTOP1 CreateTable(SqlDataReader reader)
        {
            return new SLTOP1()
            {
                QTY = (Double)reader["QTY"],
                PNAME = reader["PNAME"].ToString(),
            };
        }
        public class SLTOP1
        {
            public Nullable<double> QTY { get; set; }
            public string PNAME { get; set; }
        }
    }
}