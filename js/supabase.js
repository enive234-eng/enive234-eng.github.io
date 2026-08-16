import '../config.js';
// Set these public values before connecting production.
const config=window.ENIVE_CONFIG||{};
export const isConfigured=Boolean(config.supabaseUrl&&config.supabaseAnonKey);
export async function getClient(){if(!isConfigured)return null;const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');return createClient(config.supabaseUrl,config.supabaseAnonKey)}
