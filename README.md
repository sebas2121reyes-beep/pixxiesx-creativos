# Desarrollo creativo · Pixxiesx

Web interna para planear, producir y medir los creativos de pauta de Pixxiesx, con usuarios por rol y briefs públicos para creadores de contenido.

## Qué hay aquí

| Archivo | Qué es |
|---|---|
| `index.html`, `app.js`, `styles.css` | La web (inicio de sesión, creativos, ganadores, banco de referentes, funnel, ajustes) |
| `brief.html` | Página pública del brief para creadores: `/brief/<token>` |
| `config.js` | URL y publishable key de Supabase (públicas por diseño) |
| `supabase/schema.sql` | Tablas, permisos por rol y almacenamiento de archivos |
| `supabase/ejemplos.sql` | Datos de ejemplo (opcional) |
| `vercel.json` | Rutas y cabeceras para Vercel |

## Roles

- **Admin**: ve y edita todo, incluida la pauta, los ganadores y los ajustes. Es el único que puede eliminar.
- **Contenido**: ve sus tareas y edita la parte creativa y el brief. No ve pauta ni números (la base de datos no se los entrega).
- **Creadores externos**: no tienen usuario; reciben el link del brief, que solo muestra la parte creativa.

El primer usuario que se crea en Supabase queda como admin; los siguientes, como contenido.

## Puesta en marcha

1. Supabase → SQL Editor → pegar y correr `supabase/schema.sql` (y si quieres, `supabase/ejemplos.sql`).
2. Supabase → Authentication → Sign In / Providers → desactivar "Allow new users to sign up".
3. Supabase → Authentication → URL Configuration → Site URL: `https://creativos.pixxiesx.co` (y agregarla en Redirect URLs).
4. Supabase → Authentication → Users → Add user → crear tu usuario (queda admin).
5. Vercel → Add New Project → importar este repo → Deploy (sin build, es un sitio estático).
6. Vercel → Settings → Domains → agregar `creativos.pixxiesx.co` y crear el registro CNAME que indique en Shopify → Dominios.

Para invitar a alguien: Supabase → Authentication → Users → Add user → Send invitation.
