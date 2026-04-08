import { supabase } from './config.js';

function sanitizePath(str) {
  if (!str) return `file_${Date.now()}`;
  const result = str
    .toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.\-]/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/^[_.\-]+|[_.\-]+$/g, '');
  return result || `file_${Date.now()}`;
}

export async function uploadGalleryImage(file, path) {
  const safePath = sanitizePath(path);
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(safePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  const { data: publicURLData } = supabase.storage
    .from('gallery')
    .getPublicUrl(safePath);

  return publicURLData.publicUrl;
}

const SCHEMA_ERROR_CODES = ['PGRST204', '42703'];
const SCHEMA_ERROR_KEYWORDS = ['album_id', 'alt_text', 'is_cover', 'column'];

function isSchemaError(error) {
  if (!error) return false;
  return SCHEMA_ERROR_CODES.includes(error.code) ||
    error.status === 400 ||
    SCHEMA_ERROR_KEYWORDS.some(kw => (error.message || '').toLowerCase().includes(kw));
}

export async function addGalleryItem(item) {
  const payload = {
    url: item.url,
    caption: item.caption,
    category: item.category,
    order: item.order ?? 0,
    ...(item.album_id ? { album_id: item.album_id } : {}),
    ...(item.alt_text ? { alt_text: item.alt_text } : {}),
    ...(item.is_cover !== undefined ? { is_cover: item.is_cover } : {}),
  };

  const { data, error } = await supabase
    .from('gallery_items')
    .insert([payload]);

  if (error) {
    if (isSchemaError(error)) {
      console.warn('[KGED] Schema mismatch, core-only retry...', error.message);
      const { data: retryData, error: retryError } = await supabase
        .from('gallery_items')
        .insert([{ url: item.url, caption: item.caption, category: item.category, order: item.order ?? 0 }]);
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  }
  return data;
}

export async function deleteAlbum(albumId) {
  const { data: items } = await supabase
    .from('gallery_items')
    .select('id, url')
    .eq('album_id', albumId);
  if (items && items.length > 0) {
    for (const item of items) {
      let path = null;
      try {
        const urlObj = new URL(item.url);
        const parts = urlObj.pathname.split('/storage/v1/object/public/gallery/');
        if (parts.length > 1) path = parts[1];
      } catch {}
      await deleteGalleryItem(item.id, path);
    }
  }
}

export async function getGalleryItems() {
  if (!supabase) return [];
  // First try with everything, sort by order then created_at
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('order', { ascending: true })
    .order('created_at', { ascending: false });
  
  // If column missing in DB, fallback to core columns
  if (error && isSchemaError(error)) {
    console.warn('[KGED] Fallback to core columns:', error.message);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('gallery_items')
      .select('id, url, caption, category, created_at')
      .order('created_at', { ascending: false });
    if (fallbackError) throw fallbackError;
    return fallbackData;
  }
  
  if (error) throw error;
  return data || [];
}

export async function deleteGalleryItem(id, imagePath) {
  // 1. Delete from DB
  const { error: dbError } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id);
  if (dbError) throw dbError;

  // 2. Delete from Storage (optional, based on path)
  if (imagePath) {
    const { error: storageError } = await supabase.storage
      .from('gallery')
      .remove([imagePath]);
    // Silence storage errors if file already gone, but log it
    if (storageError) console.warn("Storage deletion error (non-blocking):", storageError);
  }
}

export async function updateGalleryItemOrder(id, newOrder) {
  const { error } = await supabase
    .from('gallery_items')
    .update({ order: newOrder })
    .eq('id', id);
  if (error) throw error;
}

export async function getStorageQuota() {
  const { data, error } = await supabase.storage.from('gallery').list();
  if (error) throw error;
  
  let totalBytes = 0;
  if (data) {
    totalBytes = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
  }
  
  const limitBytes = 50 * 1024 * 1024; // 50MB
  const percentUsed = Math.min((totalBytes / limitBytes) * 100, 100);
  
  return {
    totalBytes,
    limitBytes,
    percentUsed: percentUsed.toFixed(1)
  };
}
