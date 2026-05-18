using Newtonsoft.Json.Serialization;
using System.Configuration;
using System.Web.Http;
using System.Web.Http.Cors;

namespace mbExecutive
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {

            var origins = ConfigurationManager.AppSettings["corsOrigins"];
            if (!string.IsNullOrEmpty(origins))
            {
                var cors = new EnableCorsAttribute(origins, "*", "*");
                config.EnableCors(cors);
            }

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
