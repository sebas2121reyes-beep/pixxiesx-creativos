// Datos públicos del proyecto de Supabase (Project Settings → API).
// La "publishable key" está hecha para ir en el navegador; los permisos
// reales los ponen las reglas de la base de datos (supabase/schema.sql).
// Nunca pongas aquí la clave service_role.
window.PIXXIESX_CONFIG = {
  url: "https://poisfgjcjujxxekwxahi.supabase.co",
  anonKey: "sb_publishable_JboqCpBT3UcShe_0Jj8M8Q_g_dSzXIV",

  // Catálogo de Shopify (Storefront API, solo lectura de productos).
  // El token público de Storefront también está hecho para ir en el navegador.
  shopify: {
    domain: "elrayo21.myshopify.com",
    storefrontToken: "027877dd6269c29316d83ed24353ee13",
    apiVersion: "2026-10",
    tienda: "https://www.pixxiesx.co"
  }
};
