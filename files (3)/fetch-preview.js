/**
 * AMAÇ: Dış URL'den OG/meta tag çek — tarayıcı CORS kısıtını bu proxy aşar
 * KULLANIM: GET /api/fetch-preview?url=https://example.com/haber
 * DEPLOY: Bu dosyayı projenin kök dizininde /api/ klasörüne koy.
 *         Vercel otomatik olarak serverless function'a çevirir.
 */

// Özel IP aralıklarını engelle (SSRF koruması)
function isPrivateOrLoopback(hostname) {
  return (
    hostname === 'localhost' ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    hostname === '::1' ||
    /^fc00:/i.test(hostname) ||
    /^fe80:/i.test(hostname)
  );
}

// Birden fazla olası property adıyla meta tag değeri bul
function getMeta(html, ...names) {
  for (const name of names) {
    // property="og:..." veya name="description" şeklinde olabilir
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']{1,1000})["']`,
        'is'
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']{1,1000})["'][^>]+(?:property|name)=["']${name}["']`,
        'is'
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]?.trim()) return m[1].trim();
    }
  }
  return null;
}

export default async function handler(req, res) {
  // CORS — sadece kendi domain'imizden izin ver
  res.setHeader('Access-Control-Allow-Origin', '*'); // admin local test için * bırakıldı
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Sadece GET desteklenir' });

  const rawUrl = req.query?.url;
  if (!rawUrl) return res.status(400).json({ error: "'url' parametresi gerekli" });

  // URL parse ve validasyon
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'Geçersiz URL formatı' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Sadece http/https desteklenir' });
  }

  if (isPrivateOrLoopback(parsed.hostname)) {
    return res.status(400).json({ error: 'Bu adrese erişim yasak' });
  }

  try {
    // 8 saniye timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; KGED-Bot/1.0; +https://kirged.org)',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr,en;q=0.8',
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return res.status(502).json({ error: `Kaynak sunucu ${response.status} döndürdü` });
    }

    // Max 500 KB HTML oku — büyük sayfaları tamamen indirmemek için
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    let totalBytes = 0;
    const MAX = 500_000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.length;
      html += decoder.decode(value, { stream: true });
      if (totalBytes >= MAX) {
        reader.cancel().catch(() => {});
        break;
      }
    }

    // <title> fallback
    const titleTagMatch = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
    const pageTitle = titleTagMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? null;

    // OG / Twitter / standart meta
    const title =
      getMeta(html, 'og:title', 'twitter:title') || pageTitle || parsed.hostname;

    const description =
      getMeta(html, 'og:description', 'twitter:description', 'description') || '';

    let image = getMeta(html, 'og:image', 'twitter:image', 'og:image:url') || null;

    const siteName =
      getMeta(html, 'og:site_name') ||
      parsed.hostname.replace(/^www\./, '');

    // Görsel URL'ini absolute yap
    if (image) {
      try {
        image = new URL(image, rawUrl).toString();
      } catch {
        image = null;
      }
    }

    const result = {
      url: rawUrl,
      title,
      description: description.slice(0, 300),
      image,
      siteName,
      fetchedAt: Date.now(),
    };

    // 1 saat CDN cache, stale 24 saat
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(result);
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'İstek zaman aşımına uğradı (8s)' });
    }
    console.error('[fetch-preview] hata:', err.message);
    return res.status(500).json({ error: `Sunucu hatası: ${err.message}` });
  }
}
