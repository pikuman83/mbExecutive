using System.Data;

namespace mbExecutive.Auth
{
    public static class LicenseValidator
    {
        private static string PhoneHomeUrl =>
            ConfigurationManager.AppSettings["licenseServerUrl"] ?? string.Empty;

        /// <summary>
        /// Returns true when the license is valid and the request may proceed.
        /// Fail-open on DB errors: if SQL Server is unreachable the API can't
        /// serve data anyway, so there is no benefit in blocking the request.
        /// </summary>
        public static bool IsLicenseValid()
        {
            try
            {
                var rec = ReadLicenseRecord();
                if (rec == null)
                    return false;

                if (rec.Status == "Expired" || rec.Status == "Revoked")
                    return false;

                if (rec.LicenseExpiryDate.HasValue &&
                    rec.LicenseExpiryDate.Value < DateTime.UtcNow)
                    return false;

                if (!string.IsNullOrEmpty(PhoneHomeUrl) && rec.LastPhoneHomeOk.HasValue)
                {
                    var daysSincePing = (DateTime.UtcNow - rec.LastPhoneHomeOk.Value).TotalDays;
                    if (daysSincePing > rec.PhoneHomeGraceDays)
                        return false;
                }

                return true;
            }
            catch
            {
                return true;
            }
        }

        /// <summary>
        /// Fires an async phone-home check. Call once per successful login.
        /// All exceptions are swallowed — phone-home is best-effort only.
        /// </summary>
        public static void TriggerPhoneHomeAsync()
        {
            if (string.IsNullOrEmpty(PhoneHomeUrl)) return;
            Task.Run(() => DoPhoneHome());
        }

        private static void DoPhoneHome()
        {
            try
            {
                var clientId = GetClientId();
                if (string.IsNullOrEmpty(clientId)) return;

                var url = string.Format("{0}?clientId={1}",
                    PhoneHomeUrl.TrimEnd('/'),
                    Uri.EscapeDataString(clientId));

                using (var client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromSeconds(10);
                    var response = client.GetAsync(url).Result;
                    if (response.IsSuccessStatusCode)
                        UpdateLastPhoneHome();
                }
            }
            catch { }
        }

        private static string GetClientId()
        {
            try { return ReadLicenseRecord()?.ClientId; }
            catch { return null; }
        }

        private static void UpdateLastPhoneHome()
        {
            string cs = ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
            using (var sql = new SqlConnection(cs))
            using (var cmd = new SqlCommand("web_UpdatePhoneHome", sql))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                sql.Open();
                cmd.ExecuteNonQuery();
            }
        }

        private static LicenseRecord ReadLicenseRecord()
        {
            string cs = ConfigurationManager.ConnectionStrings["cstring"].ConnectionString;
            using (var sql = new SqlConnection(cs))
            using (var cmd = new SqlCommand("web_CheckLicense", sql))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                sql.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (!reader.Read()) return null;
                    return new LicenseRecord
                    {
                        Status             = reader["Status"].ToString(),
                        LicenseExpiryDate  = reader["LicenseExpiryDate"] as DateTime?,
                        LastPhoneHomeOk    = reader["LastPhoneHomeOk"] as DateTime?,
                        PhoneHomeGraceDays = (int)reader["PhoneHomeGraceDays"],
                        ClientId           = reader["ClientId"].ToString()
                    };
                }
            }
        }

        private class LicenseRecord
        {
            public string    Status             { get; set; }
            public DateTime? LicenseExpiryDate  { get; set; }
            public DateTime? LastPhoneHomeOk    { get; set; }
            public int       PhoneHomeGraceDays { get; set; }
            public string    ClientId           { get; set; }
        }
    }
}
