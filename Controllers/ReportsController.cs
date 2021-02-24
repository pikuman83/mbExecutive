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
                if (table == "product") { query = "select pcode, pname from product"; };
                if (table == "customers") { query = "select vcode, vname, city from party where atype = 0"; };
                if (table == "suppliers") { query = "select vcode, vname, city from party where atype = 1"; };
                if (table == "Cash") { query = @"select acode, aname from account where atype in (0,4)"; };
                
                using (SqlCommand cmd = new SqlCommand(query, sql))
                {
                    var response = new List<Object>();
                    await sql.OpenAsync();

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            if (table == "mgrp" || table == "location") response.Add(new objectModel { col1 = reader["gname"].ToString()});
                            if (table == "pgroup") response.Add(new objectModel { col1 = reader["pgname"].ToString()});
                            if (table == "city") response.Add(new objectModel { col1 = reader["cname"].ToString()});
                            if (table == "account"||table == "Cash") response.Add(new objectModel { col1 = reader["acode"].ToString(), col2 = reader["aname"].ToString()});
                            if (table == "product") response.Add(new objectModel { col1 = reader["pcode"].ToString(), col2 = reader["pname"].ToString()});
                            if (table == "customers"||table == "suppliers") response.Add(new objectModel { col1 = reader["vcode"].ToString(), col2 = reader["vname"].ToString(), col3 = reader["city"].ToString() });
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