// Returns the current prime rate (Bank of Israel interest rate + 1.5).
// The response is cached on Netlify's CDN for a week, so the Bank of Israel
// is queried at most about once a week. If the lookup fails, the fallback
// value below is returned so the calculator keeps working.

const FALLBACK_BOI_RATE = 3.25; // => prime 4.75
const PRIME_SPREAD = 1.5;
const WEEK = 7 * 24 * 60 * 60;

// Bank of Israel SDMX API, series MNT_RIB_BOI_D = Bank of Israel interest rate
const BOI_URL =
  'https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BR/1.0/MNT_RIB_BOI_D?format=csv&startperiod=';

function parseLatestRate(csv) {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;
  const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toUpperCase());
  const timeIdx = header.indexOf('TIME_PERIOD');
  const valIdx = header.indexOf('OBS_VALUE');
  if (timeIdx < 0 || valIdx < 0) return null;

  let latest = null;
  for (const line of lines.slice(1)) {
    const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
    const date = cols[timeIdx];
    const value = parseFloat(cols[valIdx]);
    if (!date || !Number.isFinite(value)) continue;
    if (!latest || date > latest.date) latest = { date, value };
  }
  return latest;
}

function respond(body, maxAge) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Netlify-CDN-Cache-Control': `public, durable, s-maxage=${maxAge}, stale-while-revalidate=${WEEK}`,
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async () => {
  try {
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const res = await fetch(BOI_URL + since, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('BOI status ' + res.status);
    const latest = parseLatestRate(await res.text());
    if (!latest || latest.value < 0 || latest.value > 15) throw new Error('Unexpected BOI data');

    return respond({
      prime: Math.round((latest.value + PRIME_SPREAD) * 100) / 100,
      boiRate: latest.value,
      asOf: latest.date,
      source: 'boi',
    }, WEEK);
  } catch (err) {
    console.error('get-prime:', err.message);
    // Cache the fallback only briefly so the next request retries soon.
    return respond({
      prime: FALLBACK_BOI_RATE + PRIME_SPREAD,
      boiRate: FALLBACK_BOI_RATE,
      source: 'fallback',
    }, 3600);
  }
};
