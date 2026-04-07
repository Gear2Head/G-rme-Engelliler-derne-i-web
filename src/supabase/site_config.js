import { supabase } from './config.js';

/**
 * TODO 13: Site içeriğini (Hakkımızda, İletişim, Yönetim Kurulu) Supabase'den yönetme
 */

export async function getSiteConfig() {
  const { data, error } = await supabase
    .from('site_config')
    .select('data')
    .eq('id', 'content')
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
    throw error;
  }
  return data ? data.data : null;
}

export async function saveSiteConfig(configData) {
  const { data, error } = await supabase
    .from('site_config')
    .upsert({ id: 'content', data: configData, updated_at: new Date().toISOString() })
    .select();
    
  if (error) throw error;
  return data;
}
