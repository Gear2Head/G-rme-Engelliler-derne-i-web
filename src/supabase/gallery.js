import { supabase } from './config.js';

function sanitizePath(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9_.\-]/g, '');
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

  // Handle potential schema mismatch (400 Bad Request) - Retry without optional fields
  if (error) {
    console.group("Supabase Insert Error Diagnostic");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.groupEnd();
    
    // PGRST204 is 'Column not found'
    if (error.code === 'PGRST204' || error.message.includes('album_id') || error.message.includes('alt_text') || error.status === 400) {
      console.warn("Retrying upload with Core Fields ONLY due to potential schema mismatch...");
      const fallbackPayload = {
        url: item.url,
        caption: item.caption,
        category: item.category,
        order: item.order ?? 0
      };
      const { data: retryData, error: retryError } = await supabase
        .from('gallery_items')
        .insert([fallbackPayload]);
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
  // First try with everything
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  // If album_id is missing in DB (PGRST204), fallback to core columns
  if (error && (error.code === 'PGRST204' || error.message.includes('album_id'))) {
    console.warn("Falling back to core columns select due to missing album_id in DB.");
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('gallery_items')
      .select('id, url, caption, category, created_at, order')
      .order('created_at', { ascending: false });
    if (fallbackError) throw fallbackError;
    return fallbackData;
  }
  
  if (error) throw error;
  return data;
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
