using Alaik.Domain.Enums;

namespace Alaik.Domain;

/// <summary>Per-tier limits. Free is the most restricted; Max is unlimited.</summary>
public static class PlanLimits
{
    public static (int MaxEvents, int MaxGifts) For(SubscriptionTier tier) => tier switch
    {
        SubscriptionTier.Max => (int.MaxValue, int.MaxValue),
        SubscriptionTier.Plus => (3, 20),
        _ => (1, 10), // Free
    };
}
