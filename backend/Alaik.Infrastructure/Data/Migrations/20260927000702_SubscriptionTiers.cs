using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Alaik.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SubscriptionTiers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PremiumUntil",
                table: "Users",
                newName: "SubscriptionUntil");

            migrationBuilder.AddColumn<int>(
                name: "Tier",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tier",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "SubscriptionUntil",
                table: "Users",
                newName: "PremiumUntil");
        }
    }
}
