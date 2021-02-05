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
        public async Task<List<Object>> GetData(string table)
        {
            string cs = System.Configuration.ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
            using (SqlConnection sql = new SqlConnection(cs))
            {
                string query = "select * from " + table;
                using (SqlCommand cmd = new SqlCommand(query, sql))
                {
                    var response = new List<Object>();
                    await sql.OpenAsync();

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            if (table == "mgrp") response.Add(new objectModel { col1 = reader["gname"].ToString() });
                            if (table == "pgroup") response.Add(new objectModel { col1 = reader["pgname"].ToString()});
                            if (table == "city") response.Add(new objectModel { col1 = reader["cname"].ToString()});
                        }
                    }
                    return response;
                }

            }
        }
        public class objectModel
        {
            public string col1 { get; set; }
            public string col2 { get; set; }
            public string col3 { get; set; }
            //public string Extra1 { get; set; }
        }
    }
}