using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace mbExecutive.Models
{
    public class SF_Recovery
    {
        public string myFormula(string param3, string param4, string param5)
        {
            string SF = "";
            if (!string.IsNullOrEmpty(param3) && !string.IsNullOrEmpty(param4) && !string.IsNullOrEmpty(param5)) SF = "ucase({BALREP.VNAME}) = '" + param3 + "' AND ucase({BALREP.PGNAME}) = '" + param4 + "' AND ucase({BALREP.CITY}) = '" + param5 + "'";
            if (string.IsNullOrEmpty(param3)) SF = "ucase({BALREP.PGNAME}) = '" + param4 + "' AND ucase({BALREP.CITY}) = '" + param5 + "'";
            if (string.IsNullOrEmpty(param4)) SF = "ucase({BALREP.VNAME}) = '" + param3 + "' AND ucase({BALREP.CITY}) = '" + param5 + "'";
            if (string.IsNullOrEmpty(param5)) SF = "ucase({BALREP.VNAME}) = '" + param3 + "' AND ucase({BALREP.PGNAME}) = '" + param4 + "'";
            if (string.IsNullOrEmpty(param3) && string.IsNullOrEmpty(param4)) SF = "ucase({BALREP.CITY}) = '" + param5 + "'";
            if (string.IsNullOrEmpty(param3) && string.IsNullOrEmpty(param5)) SF = "ucase({BALREP.PGNAME}) = '" + param4 + "'";
            if (string.IsNullOrEmpty(param4) && string.IsNullOrEmpty(param5)) SF = "ucase({BALREP.VNAME}) = '" + param3 + "'";
            return SF;
        }
    }
}