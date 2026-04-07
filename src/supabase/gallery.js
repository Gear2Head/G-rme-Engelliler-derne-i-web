import { supabase } from './config.js';

export async function uploadGalleryImage(file, path) {
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  
  const { data: publicURLData } = supabase.storage
    .from('gallery')
    .getPublicUrl(path);
    
  return publicURLData.publicUrl;
}

export async function addGalleryItem(item) {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert([item])
    .select();
  if (error) throw error;
  return data;
}

export async function getGalleryItems() {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });
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
