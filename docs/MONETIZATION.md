# Monetization setup (detailed)

Alaik earns three ways: **subscriptions** (Alaik Plus / Max), **ads** (free tier), and
**affiliate** commissions. The app code is done — this guide is the exact, click-by-click
account setup. Identifiers in **bold** must match the code (noted per step).

## Tiers

| Tier | Price (suggested) | Events | Gifts / event | Ads |
|------|-------------------|--------|---------------|-----|
| Free | — | 1 | 10 | yes |
| Alaik Plus | ₸990 / mo | 3 | 20 | no |
| Alaik Max | ₸1,990 / mo | unlimited | unlimited | no |

Limits: `backend/Alaik.Domain/PlanLimits.cs`. Prices/labels: `alaik-web/src/lib/i18n.ts`.

---

# 1. Subscriptions — RevenueCat + App Store Connect

Code involved: `alaik-web/src/lib/billing.ts` (purchase) and
`backend/Alaik.Api/Controllers/BillingController.cs` (`/api/billing/webhook`).

### 1.0 Prerequisites
- Apple Developer Program membership ($99/yr), enrolled and active.
- App ID `kz.alaik.app` registered (In-App Purchase is on by default — see APP_STORE.md).
- A RevenueCat account (free up to $2.5k/mo tracked revenue): https://app.revenuecat.com

### 1.1 App Store Connect → create the app
1. https://appstoreconnect.apple.com → **My Apps → + → New App**.
2. Platform iOS, name **Alaik**, primary language Russian, bundle ID `kz.alaik.app`, SKU
   `alaik` (any unique string). Create.

### 1.2 Sign the Paid Apps agreement (REQUIRED — IAP won't work without it)
1. App Store Connect → **Business** (or **Agreements, Tax, and Banking**).
2. Accept the **Paid Applications** agreement, then add **Bank** and **Tax** info.
   Until this shows "Active", subscriptions can't be created or purchased.

### 1.3 Create the subscription group + two products
1. Your app → **Monetization → Subscriptions → Create** a group, e.g. `Alaik`.
2. **+** Add a subscription:
   - Reference Name: `Alaik Plus Monthly`
   - **Product ID: `alaik_plus_monthly`**  ← must equal `PRODUCTS.Plus` in `billing.ts`
   - Duration: 1 month. Add price (₸990 → pick the KZT tier). Add a localized display
     name + description (RU/EN). Upload a review screenshot later.
3. **+** Add a second subscription in the same group:
   - Reference Name: `Alaik Max Monthly`
   - **Product ID: `alaik_max_monthly`**  ← must equal `PRODUCTS.Max`
   - Duration: 1 month, price ₸1,990, localized text.
4. (Optional) also create `_yearly` products if you want annual plans; add them to
   `PRODUCTS` and the paywall.
5. Each product's status will be "Ready to Submit" — that's fine for sandbox testing; they
   get reviewed with your first app submission.

### 1.4 App-Specific Shared Secret → RevenueCat
1. App Store Connect → your app → **App Information** (or Subscriptions page) →
   **App-Specific Shared Secret → Generate/Manage**. Copy it.
2. You'll paste it into RevenueCat in 1.6.

### 1.5 (Recommended) In-App Purchase Key for the App Store Server API
1. App Store Connect → **Users and Access → Integrations → In-App Purchase** (keys).
2. Generate a key, download the `.p8`, note the **Key ID** and **Issuer ID**.
3. This lets RevenueCat verify/refresh subscriptions server-side (more reliable than the
   shared secret alone). Provide it to RevenueCat in 1.6.

### 1.6 RevenueCat → project + app
1. RevenueCat → **Create project** "Alaik" → **Add app → App Store**.
2. App bundle ID `kz.alaik.app`. Paste the **App-Specific Shared Secret** (1.4) and, if you
   made one, upload the **In-App Purchase Key** `.p8` + Key ID + Issuer ID (1.5).

### 1.7 RevenueCat → Products, Entitlements, Offering
1. **Products**: import/add `alaik_plus_monthly` and `alaik_max_monthly` (RevenueCat can
   pull them from App Store Connect once linked).
2. **Entitlements → +**:
   - Create **`plus`** → attach product `alaik_plus_monthly`.  ← equals `ENTITLEMENTS.Plus`
   - Create **`max`** → attach product `alaik_max_monthly`.   ← equals `ENTITLEMENTS.Max`
3. **Offerings → +**: create an offering (e.g. `default`), mark it **Current**, and add a
   **package** for each product (Monthly → alaik_plus_monthly, and a second → alaik_max_monthly).
   The code reads `offerings.current.availablePackages` and matches by product id.

### 1.8 RevenueCat → API key → app env
1. RevenueCat → **Project settings → API keys** → copy the **Apple / iOS public SDK key**
   (starts with `appl_`).
2. In `alaik-web/.env.production`:
   ```
   VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxx
   ```
   `initBilling()` (in `main.tsx`) calls `Purchases.configure({ apiKey })` on device.

### 1.9 RevenueCat → webhook → API env
1. RevenueCat → **Integrations → Webhooks → + New**.
   - **URL**: `https://<your-railway-url>/api/billing/webhook`
   - **Authorization header value**: invent a strong secret and paste it here.
2. On the API (Railway → Variables), set:
   ```
   RevenueCat__AuthHeader=<the same secret>
   RevenueCat__PlusEntitlement=plus   # optional; defaults to "plus"
   RevenueCat__MaxEntitlement=max     # optional; defaults to "max"
   ```
   The webhook checks the header, reads `app_user_id` (= our `User.Id`, because the app
   calls `Purchases.logIn(userId)`), maps `entitlement_ids` → tier, honours
   `EXPIRATION`/`CANCELLATION`, and sets `Tier` + `SubscriptionUntil`.

### 1.10 Build & wire native
```
cd alaik-web
npm run build
npx cap sync ios        # installs the RevenueCat pod into the iOS project
npx cap open ios        # Xcode: set your Signing Team; no extra capability needed for IAP
```

### 1.11 Test in Sandbox (no real charge)
1. App Store Connect → **Users and Access → Sandbox → Testers** → add a test Apple ID
   (use an email you don't already use for Apple).
2. On a real device: Settings → App Store → sign out of your real account (sandbox prompts
   at purchase time on modern iOS).
3. Run Alaik from Xcode → open the paywall → **Subscribe** → sign in with the sandbox
   tester → confirm. The purchase completes, RevenueCat records it, the webhook flips your
   backend tier, and the app shows "Подписка активна ✨".
4. (Optional local-only) add a **StoreKit Configuration File** in Xcode to test the paywall
   in the Simulator without App Store Connect.

### 1.12 Identifier checklist (must match exactly)
| Code (`billing.ts`) | App Store Connect | RevenueCat |
|---|---|---|
| `PRODUCTS.Plus = alaik_plus_monthly` | product ID | product |
| `PRODUCTS.Max = alaik_max_monthly` | product ID | product |
| `ENTITLEMENTS.Plus = plus` | — | entitlement id |
| `ENTITLEMENTS.Max = max` | — | entitlement id |
| `VITE_REVENUECAT_IOS_KEY` | — | iOS public SDK key |

---

# 2. Ads — Google AdMob (free tier only)

Code involved: `alaik-web/src/lib/ads.ts` and `alaik-web/src/components/AdBanner.tsx`.
Ads show only for free users and only inside the app (never on the public guest list).

### 2.1 AdMob account + app + ad units
1. https://admob.google.com → sign in → **Apps → Add app**.
2. Platform iOS. If not on the App Store yet, choose "No, it's not listed yet" — you can
   link the real App Store id later.
3. Copy the **AdMob App ID** for iOS: looks like `ca-app-pub-XXXXXXXX~YYYYYYYY` (with `~`).
4. In that app → **Ad units → Add ad unit**, create two:
   - a **Banner** unit → id `ca-app-pub-XXXXXXXX/ZZZZZZZZ`
   - an **Interstitial** unit (full-screen) → id `ca-app-pub-XXXXXXXX/IIIIIIII`

### 2.2 App env
`alaik-web/.env.production`:
```
VITE_ADMOB_IOS_BANNER=ca-app-pub-XXXXXXXX/ZZZZZZZZ
VITE_ADMOB_IOS_INTERSTITIAL=ca-app-pub-XXXXXXXX/IIIIIIII
VITE_ADMOB_ANDROID_BANNER=            # only if you ship Android
VITE_ADMOB_ANDROID_INTERSTITIAL=      # only if you ship Android
```

### 2.2b Interstitial (full-screen) ads
- Shown **after creating an event** (a natural break), free tier only, and **capped to
  once every 3 minutes** (`INTERSTITIAL_MIN_INTERVAL_MS` in `src/lib/ads.ts`).
- The "wait, then close (✕)" countdown is controlled by AdMob — you can't shorten it.
- Keep them infrequent and only at transitions; Apple/Google reject apps that show
  interstitials mid-task, on launch before content, or too often. To add more triggers,
  call `maybeShowInterstitial(isPremium)` at other completion points.
- Until you set the env id, Google's **test interstitial** shows (safe on the Simulator).

### 2.3 Native config (iOS Info.plist)
Add to `ios/App/App/Info.plist` (edit in Xcode or the file directly):
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXX~YYYYYYYY</string>  <!-- the App ID (~), not the unit ID -->

<key>NSUserTrackingUsageDescription</key>
<string>We use this to show more relevant ads. You can keep ads non-personalized.</string>

<key>SKAdNetworkItems</key>
<array>
  <!-- paste the full SKAdNetworkIdentifier list Google publishes for AdMob -->
  <dict><key>SKAdNetworkIdentifier</key><string>cstr6suwn9.skadnetwork</string></dict>
  <!-- ...(add the rest from Google's current list)... -->
</array>
```
(The current `SKAdNetworkItems` list is on Google's "Prepare for iOS 14" AdMob page.)

### 2.4 App Tracking Transparency (ATT)
- iOS requires the ATT prompt before you can use the advertising identifier for
  personalized ads. The Google Mobile Ads SDK will request it; `initAds()` initializes the
  SDK at startup. If you prefer non-personalized ads, you can request non-personalized and
  skip aggressive tracking — but still ship the `NSUserTrackingUsageDescription` string.
- If you use ATT, declare **Tracking** in App Store Connect App Privacy accordingly.

### 2.5 Build & test with TEST ids first
```
cd alaik-web && npm run build && npx cap sync ios
```
- While developing, use Google's **test ad unit IDs** (banner iOS
  `ca-app-pub-3940256099942544/2934735716`) so you don't risk your account by clicking live
  ads. Swap to your real unit IDs before release.
- Run on device: as a free user you'll see the banner at the bottom; subscribe → it
  disappears (`AdBanner` calls `hideBanner()` for premium).

> Honest note: ads are marginal on a warm gifting app and add the ATT prompt. Many ship
> subscriptions + affiliate first and enable ads later — it's one component to toggle.

---

# 3. Affiliate — commissions on outbound store links

Code involved: `alaik-web/src/lib/affiliate.ts` (already routes every "open in store" tap
through `withAffiliate()`). No Apple cut — physical goods.

### 3.1 Choose a network
- **Admitad** (https://admitad.com) — carries Wildberries, Ozon, AliExpress, and many KZ/RU
  stores. Deeplink-based.
- **ePN** (https://epn.bz) — AliExpress + marketplaces.
- **Store-direct** — some stores (Ozon, Kaspi partner) run their own programs.
Pick one to start; Admitad has the widest KZ/RU catalog.

### 3.2 Apply and get approved
1. Register as a **publisher/webmaster**.
2. Add a "space"/property — you can register your app or the `alaik.app` site.
3. Apply to the specific **store programs** you want (Wildberries, Ozon, …). Approval is
   per-store and can take a day or two.

### 3.3 Get your link format
After approval each program gives you either:
- a **deeplink template**, e.g. `https://ad.admitad.com/g/<campaign_code>/?ulp=<TARGET_URL>`
  where `<TARGET_URL>` is the URL-encoded product link, or
- **tracking query params** to append to the store URL.

### 3.4 Add to the code
Edit `RULES` in `alaik-web/src/lib/affiliate.ts` with your real codes:
```ts
const RULES: AffiliateRule[] = [
  { match: 'wildberries.ru', deeplink: (u) => `https://ad.admitad.com/g/ABC123/?ulp=${u}` },
  { match: 'ozon.ru',        deeplink: (u) => `https://ad.admitad.com/g/DEF456/?ulp=${u}` },
  { match: 'aliexpress',     deeplink: (u) => `https://ad.admitad.com/g/GHI789/?ulp=${u}` },
  { match: 'kaspi.kz',       appendParams: { utm_source: 'alaik' } }, // if using params
];
```
`match` is a case-insensitive substring of the link's host. `u` is already URL-encoded.

### 3.5 Rebuild & verify
```
cd alaik-web && npm run build && npx cap sync ios
```
Add a gift with a Wildberries link, open it as a guest, tap the item — it should route
through your deeplink. Check clicks/commissions in the network dashboard.

---

## Env var summary

`alaik-web/.env.production`
```
VITE_API_URL=https://<your-railway-url>
VITE_REVENUECAT_IOS_KEY=appl_xxx
VITE_ADMOB_IOS_BANNER=ca-app-pub-xxx/xxx
VITE_ADMOB_ANDROID_BANNER=ca-app-pub-xxx/xxx
```

API (Railway → Variables)
```
RevenueCat__AuthHeader=<webhook secret>
RevenueCat__PlusEntitlement=plus   # optional
RevenueCat__MaxEntitlement=max     # optional
```
