﻿using Newtonsoft.Json.Serialization;
using System.Web.Http;
using System.Web.Http.Cors;

namespace mbExecutive
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
    
            var cors = new EnableCorsAttribute("http://110.38.214.222", "*", "*"); //http://110.38.214.222 http://mbdashboard-001-site1.gtempurl.com
            config.EnableCors(cors);
      
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            var jsonFormatter = config.Formatters.JsonFormatter;
            jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            config.Formatters.Remove(config.Formatters.XmlFormatter);
            jsonFormatter.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
        }
    }
    
}
