// Affiliate link tagging. Every outbound "open in store" tap is purchase intent —
// rewrite the URL so purchases are attributed to your affiliate / CPA account.
//
// This ships as a no-op (pass-through) until you add your APPROVED program config
// below. Two patterns are supported per store:
//   • appendParams — add tracking query params to the store URL
//       { match: 'kaspi.kz', appendParams: { utm_source: 'alaik' } }
//   • deeplink — wrap the target in a CPA network deeplink (Admitad, ePN, etc.)
//       { match: 'ozon.ru', deeplink: (u) => `https://ad.admitad.com/g/XXXX/?ulp=${u}` }
//
// `u` passed to deeplink is the already-encoded target URL.

interface AffiliateRule {
  match: string; // domain substring, case-insensitive
  appendParams?: Record<string, string>;
  deeplink?: (encodedTargetUrl: string) => string;
}

const RULES: AffiliateRule[] = [
  // Example (disabled — replace with your real, approved IDs):
  // { match: 'wildberries.ru', deeplink: (u) => `https://ad.admitad.com/g/YOURID/?ulp=${u}` },
  // { match: 'ozon.ru',        deeplink: (u) => `https://ad.admitad.com/g/YOURID/?ulp=${u}` },
  // { match: 'kaspi.kz',       appendParams: { utm_source: 'alaik' } },
];

export function withAffiliate(rawUrl: string): string {
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  let host: string;
  try {
    host = new URL(url).host.toLowerCase();
  } catch {
    return url;
  }

  const rule = RULES.find((r) => host.includes(r.match.toLowerCase()));
  if (!rule) return url;

  if (rule.deeplink) return rule.deeplink(encodeURIComponent(url));

  if (rule.appendParams) {
    try {
      const u = new URL(url);
      for (const [k, v] of Object.entries(rule.appendParams)) u.searchParams.set(k, v);
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}
