/**
 * AMAÇ: URL'den OG meta tagları çek — CORS bypass için proxy endpoint
 * MANTIK: SSRF koruması + timeout + cache header
 */

// Private IP SSRF koruması
function isPrivateIP(hostname) {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|::1|fc00:|fe80:)/.test(hostname);
}

function getMetaContent(html, ...properties) {
  for (const prop of properties) {
    const match =
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']{1,500})["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']{1,500})["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

export default async function handler(req, res) {
  // Sadece GET
  if (req.method !== 'GET') return res.status(405).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url parametresi gerekli' });

  // URL validasyon
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Geçersiz URL formatı' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Sadece HTTP/HTTPS URL desteklenir' });
  }

  // SSRF koruması
  if (isPrivateIP(parsed.hostname)) {
    return res.status(400).json({ error: 'Bu IP aralığına erişim yasak' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KGED-LinkPreview/1.0 (+https://kirged.org)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr,en;q=0.9',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = await response.arrayBuffer();
    const html = new TextDecoder().decode(buffer.slice(0, 500000)); // Max 500KB

    const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
    let ogImage = getMetaContent(html, 'og:image', 'twitter:image');

    // Görsel URL'ini absolute yap
    if (ogImage && !ogImage.startsWith('http')) {
      try { ogImage = new URL(ogImage, `${parsed.origin}/`).toString(); } catch { ogImage = null; }
    }

    const preview = {
      url,
      title: getMetaContent(html, 'og:title', 'twitter:title') || titleMatch?.[1]?.trim() || parsed.hostname,
      description: getMetaContent(html, 'og:description', 'description', 'twitter:description') || '',
      image: ogImage,
      siteName: getMetaContent(html, 'og:site_name') || parsed.hostname.replace('www.', ''),
      fetchedAt: Date.now(),
    };

    // 1 saatlik cache, 24 saat stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin to use the API
    res.json(preview);

  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Sayfa zaman aşımına uğradı (8s)' });
    }
    res.status(500).json({ error: `Fetch hatası: ${err.message}` });
  }
}
