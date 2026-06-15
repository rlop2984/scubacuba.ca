# 📬 Migración del correo info@scubacuba.ca → Google Workspace

**Objetivo:** sacar el correo de HostPapa (sin control propio) y ponerlo en
**Google Workspace** (Gmail con el dominio), cuenta a nombre de Reinier,
gestionado vía el DNS de **Cloudflare** que el usuario ya controla.

**Decidido (11 jun 2026):**
- Proveedor: **Google Workspace** (elegido por seguridad). ~$7 USD/mes,
  14 días de prueba.
- Solo se necesita **info@scubacuba.ca**.
- Hay que **rescatar los correos viejos** de HostPapa (el usuario tiene
  acceso a HostPapa).
- DNS en **Cloudflare** (cuenta del usuario). ⚠️ El dominio está
  **registrado en GoDaddy**, pero el DNS lo sirve Cloudflare → todos los
  registros van en **CLOUDFLARE**, nunca en GoDaddy.

---

## 🚨 REGLAS DE ORO (no romper nada)

1. **Todos los registros DNS van en Cloudflare**, NO en GoDaddy. GoDaddy
   es solo el registrador (la "escritura"); Cloudflare es el DNS activo.
2. **NO cambiar los Nameservers en GoDaddy.** Deben seguir apuntando a
   `peaches.ns.cloudflare.com` / `seamus.ns.cloudflare.com`. Si se cambian,
   se rompe la web (Netlify), los 96 redirects SEO y el correo.
3. Si Google ofrece **"verificar/conectar automáticamente con GoDaddy"** →
   NO usarlo. Elegir **verificación manual con registro TXT**.
4. **El MX se cambia AL FINAL** (paso 4), después de crear el buzón y
   migrar los correos viejos. Así no se pierde correo entrante.
5. **NO tocar los registros de la WEB** en Cloudflare (A raíz 75.2.60.5,
   CNAME www → scubacuba.netlify.app). Esto es solo correo.

---

## 📊 Estado ACTUAL (HostPapa) — verificado por DNS

| Registro | Valor actual |
|---|---|
| MX | `0 mail.scubacuba.ca` → 45.56.222.219 (HostPapa) |
| SPF | `v=spf1 ip4:45.56.222.219 ip4:204.44.192.31 +a +mx +include:spf.antispamcloud.com ~all` |
| DKIM | `default._domainkey` (HostPapa) |
| DMARC | `v=DMARC1; p=none; rua=mailto:info@scubacuba.ca` |
| Web (NO TOCAR) | Netlify — 75.2.60.5 / www → scubacuba.netlify.app |

---

## ✅ Plan paso a paso

### Paso 1 — Verificar el dominio en Google Workspace  ← ESTAMOS AQUÍ
- En el setup de Google Workspace (pantalla "Verifica que este dominio te
  pertenece"), elegir **verificación con registro TXT** (manual).
- Google da un código: `google-site-verification=XXXXXXXXXX`.
- En **Cloudflare → scubacuba.ca → DNS → Add record**:
  - Type: **TXT** · Name: **@** · Content: `google-site-verification=XXXX`
  - Proxy: **DNS only** (gris) · TTL: Auto
- Volver a Google → **"Verify"**. (El correo sigue en HostPapa por ahora.)

### Paso 2 — Crear el buzón info@scubacuba.ca
- En Google Workspace Admin → crear el usuario **info@scubacuba.ca**.
- Definir contraseña.

### Paso 3 — Migrar correos viejos de HostPapa → Gmail
- Google Workspace Admin → **Data migration** → IMAP.
- Datos HostPapa (confirmar en la cuenta HostPapa):
  - Servidor: `mail.scubacuba.ca` · Puerto 993 SSL
  - Usuario: `info@scubacuba.ca` · Password del buzón HostPapa
- Esto copia el historial mientras el correo aún llega a HostPapa.

### Paso 4 — ⚡ EL SWITCH: cambiar el MX en Cloudflare
Cuando el buzón esté listo y los correos importados:
- En **Cloudflare → DNS**, BORRAR el MX viejo (`mail.scubacuba.ca`) y poner
  el de Google (formato nuevo simplificado):

| Type | Name | Mail server | Priority |
|---|---|---|---|
| MX | `@` | `smtp.google.com` | 1 |

  (Si Google pide el formato clásico, son 5: ASPMX.L.GOOGLE.COM prio 1,
  ALT1/ALT2 prio 5, ALT3/ALT4 prio 10.)

### Paso 5 — SPF / DKIM / DMARC para Google
- **SPF** (reemplazar el TXT viejo): `v=spf1 include:_spf.google.com ~all`
- **DKIM**: Google Admin → Apps → Gmail → Authenticate email → genera el
  registro (selector `google`); pegar el TXT en Cloudflare.
- **DMARC**: mantener `v=DMARC1; p=none; rua=mailto:info@scubacuba.ca`;
  subir a `p=quarantine` cuando lleve días estable.

### Paso 6 — Probar
- Mandar correo desde otra cuenta → confirmar que llega a **Gmail** (no HostPapa).
- Responder desde Gmail → confirmar que sale como `info@scubacuba.ca`.

### Paso 7 — Dar de baja HostPapa
- Solo cuando el paso 6 funcione y los correos viejos estén en Gmail.

---

## ⚠️ Notas
- Quien controla el **DNS (Cloudflare)** controla el correo. Ya lo tienes.
- El **registrador (GoDaddy)** solo guarda la titularidad del dominio —
  confirmar que la cuenta GoDaddy también es del usuario para control total.
- No se pierde correo si el MX se cambia AL FINAL (paso 4).
