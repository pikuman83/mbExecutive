using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.StaticFiles;
using Owin;
using System;
[assembly: OwinStartup(typeof(mbExecutive.Startup))]

namespace mbExecutive
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            string root = AppDomain.CurrentDomain.BaseDirectory;
            //var physicalFileSystem = new PhysicalFileSystem(Path.Combine(root, "wwwroot"));
            var physicalFileSystem = new PhysicalFileSystem(root);
            var options = new FileServerOptions
            {
                RequestPath = PathString.Empty,
                EnableDefaultFiles = true,
                FileSystem = physicalFileSystem
            };
            options.StaticFileOptions.FileSystem = physicalFileSystem;
            options.StaticFileOptions.ServeUnknownFileTypes = true;
            app.UseFileServer(options);
        }
    }
}