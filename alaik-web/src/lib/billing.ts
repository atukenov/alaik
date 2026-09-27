import { Capacitor } from '@capacitor/core';
import { api } from './api';
import type { Tier } from './types';

type PaidTier = Exclude<Tier, 'Free'>;

// App Store Connect product identifiers (create these as auto-renewing subscriptions).
export const PRODUCTS: Record<PaidTier, string> = {
  Plus: 'alaik_plus_monthly',
  Max: 'alaik_max_monthly',
};

// Entitlement identifiers configured in RevenueCat (attach the products to these).
const ENTITLEMENTS: Record<PaidTier, string> = { Plus: 'plus', Max: 'max' };

function tierFromEntitlements(active: Record<string, unknown>): Tier {
  if (active[ENTITLEMENTS.Max]) return 'Max';
  if (active[ENTITLEMENTS.Plus]) return 'Plus';
  return 'Free';
}

/** Configure the RevenueCat SDK once, on native, at app startup. */
export async function initBilling(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const apiKey = import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined;
  if (!apiKey) return;
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  await Purchases.configure({ apiKey });
}

/**
 * Buy a tier. On device this runs the real StoreKit purchase via RevenueCat and
 * returns the entitled tier (the backend also learns of it via the RC webhook).
 * On web/dev it calls the dev endpoint so the flow stays testable.
 */
export async function purchaseTier(tier: PaidTier, userId: string): Promise<Tier> {
  if (!Capacitor.isNativePlatform()) {
    const res = await api.devSetTier(tier);
    return res.tier as Tier;
  }
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  await Purchases.logIn({ appUserID: userId });
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(
    (p) => p.product.identifier === PRODUCTS[tier],
  );
  if (!pkg) throw new Error('product_not_found');
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return tierFromEntitlements(customerInfo.entitlements.active);
}

/** Restore prior purchases (App Store requires a visible "Restore" action). */
export async function restore(userId: string): Promise<Tier> {
  if (!Capacitor.isNativePlatform()) return 'Free';
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  await Purchases.logIn({ appUserID: userId });
  const { customerInfo } = await Purchases.restorePurchases();
  return tierFromEntitlements(customerInfo.entitlements.active);
}
