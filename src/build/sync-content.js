import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const trimmedKey = key.trim();
        // ASSUME: Vercel env vars take priority over .env.local
        if (!process.env[trimmedKey]) {
          process.env[trimmedKey] = valueParts.join('=').trim();
        }
      }
    });
  }
}

async function syncContent() {
  console.log('[KGED] İçerik senkronizasyonu başlatılıyor...');
  loadEnv();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL veya Key bulunamadı (.env.local kontrol edin)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('data')
      .eq('id', 'content')
      .maybeSingle();

    if (error) throw error;

    if (!data || !data.data) {
      console.log('⚠️ Supabase üzerinde içerik bulunamadı, senkronizasyon atlanıyor.');
      return;
    }

    if (data.data.site) {
      data.data.site.url = 'https://kirged.org';
    }

    data.data.nav = [
      { id: 'nav-home', label: 'ANASAYFA', href: '/' },
      {
        id: 'nav-about',
        label: 'DERNEĞİMİZ',
        href: '/hakkimizda',
        children: [
          { label: 'YÖNETİM KURULU', href: '/hakkimizda#yonetim' },
          { label: 'DERNEK TÜZÜĞÜ', href: '/tuzuk' },
          { label: 'HAKKIMIZDA', href: '/hakkimizda' }
        ]
      },
      { id: 'nav-events', label: 'ETKİNLİKLER', href: '/galeri' },
      { id: 'nav-multimedia', label: 'MULTİMEDYA', href: '/galeri' },
      { id: 'nav-announcements', label: 'DUYURULAR', href: '/duyurular' },
      {
        id: 'nav-contact',
        label: 'İLETİŞİM',
        href: '/iletisim',
        children: [
          { label: 'İLETİŞİM BİLGİLERİ', href: '/iletisim' },
          { label: 'YÖNETİCİ GİRİŞİ', href: '/admin/' }
        ]
      }
    ];

    const targetPath = path.resolve(process.cwd(), 'src/data/site-content.json');
    fs.writeFileSync(targetPath, JSON.stringify(data.data, null, 2), 'utf8');

    const publicPath = path.resolve(process.cwd(), 'public/site-content.json');
    fs.writeFileSync(publicPath, JSON.stringify(data.data, null, 2), 'utf8');

    console.log('✅ Supabase verileri başarıyla src/data/site-content.json üzerine yazıldı.');
  } catch (err) {
    console.error('❌ Senkronizasyon hatası:', err.message);
    process.exit(1);
  }
}

syncContent();
