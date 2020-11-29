using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Narwhal.Service.Services;

namespace Narwhal.Service
{
    public class Startup
    {
        private readonly string _corsPolicy = "corsPolicy";
        
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(name: _corsPolicy, builder =>
                    {
                        builder.WithOrigins("http://127.0.0.1:6162");
                    });
            });
            
            services.AddControllers();
            services.AddSignalR();

            services.AddSingleton<DatabaseService>();
            services.AddSingleton<MessagingService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();
            app.UseCors(_corsPolicy);
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            // Debug gadget
            app.Use(r => c => r(c));
        }
    }
}
