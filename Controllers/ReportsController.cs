using mbExecutive.Auth;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Web.Http;

namespace mbExecutive.Controllers
{
    public class ReportsController : ApiController
    {
        [JwtAuthentication]
        public async Task<List<Object>> GetData(string sp)
        {
            string cs = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
            using (SqlConnection sql = new SqlConnection(cs))
            {
                using (SqlCommand cmd = new SqlCommand(sp, sql))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    var response = new List<Object>();
                    await sql.OpenAsync();

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            //an if can be added here to parse objects other than customers, creating a new parser CreateTable()
                            response.Add(CreateTable(reader));
                            //fruits.Add(new FruitModel
                            //{
                            //    FruitName = sdr["FruitName"].ToString(),
                            //    FruitId = Convert.ToInt32(sdr["FruitId"])
                            //});
                        }
                    }
                    return response;
                }

            }
        }
        
        private Customers CreateTable(SqlDataReader reader)
        {
            return new Customers()
            {
                Code = reader["vcode"].ToString(),
                Name = reader["vname"].ToString(),
                Extra = reader["city"].ToString(),
            };
        }
        public class Customers
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string Extra { get; set; }
            public string Extra1 { get; set; }
        }
    }
}