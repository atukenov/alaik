# Multi-stage build for the Alaik API.
# Build context must be the `backend/` directory:
#   docker build -f Alaik.Api/Dockerfile -t alaik-api .
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Alaik.Domain/Alaik.Domain.csproj Alaik.Domain/
COPY Alaik.Infrastructure/Alaik.Infrastructure.csproj Alaik.Infrastructure/
COPY Alaik.Api/Alaik.Api.csproj Alaik.Api/
RUN dotnet restore Alaik.Api/Alaik.Api.csproj

COPY . .
RUN dotnet publish Alaik.Api/Alaik.Api.csproj -c Release -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Required env vars in production:
#   ConnectionStrings__Default = Host=...;Port=5432;Database=alaik;Username=...;Password=...
#   Jwt__Key                   = <strong secret, >= 32 chars>
ENTRYPOINT ["dotnet", "Alaik.Api.dll"]
