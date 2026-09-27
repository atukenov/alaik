# Monetization setup

Alaik earns three ways: **subscriptions** (Alaik Plus / Max), **ads** (free tier), and
**affiliate** commissions on outbound store links. The app-side code is done; this guide
covers the accounts and keys you plug in.

## Tiers

| Tier | Price (suggested) | Events | Gifts / event | Ads |
|------|-------------------|--------|---------------|-----|
| Free | — | 1 | 10 | yes |
| Alaik Plus | ₸990 / mo | 3 | 20 | no |
| Alaik Max | ₸1,990 / mo | unlimited | unlimited | no |

Limits are enforced server-side in `PlanLimits.For(tier)` (`backend/Alaik.Domain/PlanLimits.cs`)
— change the numbers/prices there and in `src/lib/i18n.ts` if you want.

---

## 1. Subscriptions (Apple IAP via RevenueCat)

iOS subscriptions **must** use Apple In-App Purchase (15% under the Small Business
Program, which you'll qualify for). RevenueCat wraps StoreKit and gives you a webhook.

**A. App Store Connect** → your app → Subscriptions:
1. Create a Subscription Group (e.g. "Alaik").
2. Add two auto-renewing subscriptions with product IDs **`alaik_plus_monthly`** and
   **`alaik_max_monthly`** (must match `PRODUCTS` in `src/lib/billing.ts`). Set prices.
3. Fill localized display names, review screenshot, and the required legal text.

**B. RevenueCat** (revenuecat.com, free up to $2.5k/mo):
1. Create a project → add your iOS app (bundle `kz.alaik.app`) with the App Store
   shared secret.
2. Create **Entitlements** `plus` and `max`. Attach `alaik_plus_monthly` → `plus`,
   `alaik_max_monthly` → `max` (identifiers match `ENTITLEMENTS` in `billing.ts`).
3. Create an **Offering** with a package per product.
4. Copy the **iOS public SDK key** → set it as `VITE_REVENUECAT_IOS_KEY` in
   `alaik-web/.env.production`.
5. **Integrations → Webhooks**: URL `https://<your-api>/api/billing/webhook`, and an
   `Authorization` header value of your choosing. Put that same value in the API's
   `RevenueCat__AuthHeader` env var. (Optionally set `RevenueCat__PlusEntitlement` /
   `RevenueCat__MaxEntitlement` if you renamed the entitlements.)

**C. Build & test**: `npm run build && npx cap sync ios`, run on a device, and use a
**Sandbox tester** (App Store Connect → Users) to buy without being charged. The app calls
`Purchases.logIn(userId)` so RevenueCat's `app_user_id` equals our `User.Id`; the webhook
then sets the user's tier. On web/simulator the paywall falls back to a dev switch.

> The purchase code lives in `src/lib/billing.ts`; the webhook in
> `backend/.../Controllers/BillingController.cs`. No code changes needed — just keys.

---

## 2. Ads (Google AdMob, free tier only)

Ads show only for free users and only inside the app (never on the public guest list).

1. Create an **AdMob** account (admob.google.com) → add your app → create a **Banner** ad
   unit for iOS (and Android if you ship it).
2. Put the ad unit IDs in `alaik-web/.env.production`:
   `VITE_ADMOB_IOS_BANNER`, `VITE_ADMOB_ANDROID_BANNER`.
3. Add the AdMob **App ID** to native config:
   - iOS: `ios/App/App/Info.plist` → `GADApplicationIdentifier` = your app id, plus the
     `SKAdNetworkItems` list AdMob provides, and an `NSUserTrackingUsageDescription` string
     (required for the ATT prompt).
4. `npx cap sync ios`. `initAds()` runs at startup; `AdBanner` shows the banner for free
   users and removes it when they subscribe.

> Honest note: ads are marginal revenue on a warm gifting app and add an ATT prompt.
> Consider shipping subscriptions + affiliate first and turning ads on later — it's one
> component (`src/components/AdBanner.tsx`).

---

## 3. Affiliate commissions (best ROI, no Apple cut)

Every "open in store" tap is purchase intent. Tag those links and earn on purchases.

**How to get IDs:** join a CPA network that carries KZ/RU stores and gives deeplink/tracking
IDs, e.g. **Admitad** or **ePN** (both list Wildberries, Ozon, AliExpress, etc.), or a
store's own program (Ozon, Kaspi partner). After approval you get either:
- a **deeplink template** like `https://ad.admitad.com/g/<campaign>/?ulp=<target>`, or
- **tracking query params** to append.

**Where to add:** edit `RULES` in `alaik-web/src/lib/affiliate.ts`:

```ts
const RULES: AffiliateRule[] = [
  { match: 'wildberries.ru', deeplink: (u) => `https://ad.admitad.com/g/YOURID/?ulp=${u}` },
  { match: 'ozon.ru',        deeplink: (u) => `https://ad.admitad.com/g/YOURID/?ulp=${u}` },
  { match: 'kaspi.kz',       appendParams: { utm_source: 'alaik' } },
];
```

That's it — `openExternal()` already routes every store tap through `withAffiliate()`.
Rebuild and you're earning; no Apple cut (physical goods).

---

## Env vars (alaik-web/.env.production)

```
VITE_API_URL=https://<your-railway-url>
VITE_REVENUECAT_IOS_KEY=appl_xxx
VITE_ADMOB_IOS_BANNER=ca-app-pub-xxx/xxx
VITE_ADMOB_ANDROID_BANNER=ca-app-pub-xxx/xxx
```

## API env vars

```
RevenueCat__AuthHeader=<the secret you set on the RevenueCat webhook>
RevenueCat__PlusEntitlement=plus   # optional, defaults to "plus"
RevenueCat__MaxEntitlement=max     # optional, defaults to "max"
```
