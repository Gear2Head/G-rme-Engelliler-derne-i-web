export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const targetUrl = new URL(url);
    
    // Basic SSRF protection — don't allow local/private IPs
    // In a real prod environment, more robust validation is needed
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(targetUrl.hostname)) {
      throw new Error('Invalid target URL');
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KGED-Preview/1.0; +https://kirged.org)',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    const getMeta = (property) => {
      const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const match = html.match(regex);
      if (match) return match[1];
      
      const nameRegex = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const nameMatch = html.match(nameRegex);
      return nameMatch ? nameMatch[1] : null;
    };

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : (getMeta('og:title') || getMeta('twitter:title') || targetUrl.hostname);
    
    const description = getMeta('og:description') || getMeta('description') || getMeta('twitter:description') || '';
    const image = getMeta('og:image') || getMeta('twitter:image') || null;
    const siteName = getMeta('og:site_name') || targetUrl.hostname;

    return res.status(200).json({
      title: title.slice(0, 100),
      description: description.slice(0, 200),
      image,
      siteName,
      url: targetUrl.toString()
    });
  } catch (error) {
    console.error('[Preview API Error]:', error.message);
    return res.status(500).json({ error: 'Could not fetch link preview', details: error.message });
  }
}
