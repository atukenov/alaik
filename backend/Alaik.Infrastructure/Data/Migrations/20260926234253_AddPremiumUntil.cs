using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Alaik.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPremiumUntil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PremiumUntil",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PremiumUntil",
                table: "Users");
        }
    }
}
