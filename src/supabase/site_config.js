import { supabase } from './config.js';

/**
 * TODO 13: Site içeriğini (Hakkımızda, İletişim, Yönetim Kurulu) Supabase'den yönetme
 */

export async function getSiteConfig() {
  const { data, error } = await supabase
    .from('site_config')
    .select('data, updated_at')
    .eq('id', 'content')
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  if (data) {
    if (data.data) {
       data.data._last_updated = data.updated_at;
    }
    return data.data;
  }
  return null;
}

export async function saveSiteConfig(configData) {
  const { data, error } = await supabase
    .from('site_config')
    .upsert({ id: 'content', data: configData, updated_at: new Date().toISOString() })
    .select();
    
  if (error) throw error;
  return data;
}
