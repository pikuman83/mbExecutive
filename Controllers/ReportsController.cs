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
                var response = new List<Object>();

                string sp = null;
                if (table == "product") sp = "web_GetProducts";
                else if (table == "raw") sp = "web_GetRawProducts";
                else if (table == "customers" || table == "suppliers") sp = "web_GetParties";
                else if (table == "Cash") sp = "web_GetCashAccounts";
                else if (table == "account") sp = "web_GetLedgerAccounts";
                else if (table == "location") sp = "web_GetLocations";
                else if (table == "mgrp") sp = "web_GetMGroups";
                else if (table == "grp") sp = "web_GetGroups";
                else if (table == "pgroup") sp = "web_GetPGroups";
                else if (table == "city") sp = "web_GetCities";

                if (sp == null) return response;

                using (SqlCommand cmd = new SqlCommand(sp, sql))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    await sql.OpenAsync();

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            if (table == "location") response.Add(new objectModel { col1 = reader["gname"].ToString(), col2 = reader["gcode"].ToString()});
                            if (table == "mgrp" || table == "grp") response.Add(new objectModel { col1 = reader["gname"].ToString()});
                            if (table == "pgroup") response.Add(new objectModel { col1 = reader["pgname"].ToString()});
                            if (table == "city") response.Add(new objectModel { col1 = reader["cname"].ToString()});
                            if (table == "account" || table == "Cash") response.Add(new objectModel { col1 = reader["acode"].ToString(), col2 = reader["aname"].ToString()});
                            if (table == "product") response.Add(new objectModel { col1 = reader["pcode"].ToString(), col2 = reader["pname"].ToString()});
                            if (table == "raw") response.Add(new objectModel { col1 = reader["pcode"].ToString(), col2 = reader["pname"].ToString() });
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