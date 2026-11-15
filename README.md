# SiteBuilder — Frontend və backend inteqrasiya qeydləri

React 19 + Vite 8 ilə hazırlanmış sayt qurucusu. İstifadəçi sayt yaradır,
şablon seçir, vizual redaktorda məzmunu dəyişir və backend-də saxlayır.
İnterfeys dilləri Azərbaycan dili və ingilis dilidir.

## Layihələr

- Frontend: https://github.com/halbertonvali036/ManageSystem
- Backend (Spring Boot): https://github.com/fatimasultanova/sitebuilder-back
- Vercel layihəsi: https://vercel.com/holbss/manage-system
- Mövcud dashboard ünvanı: https://manage-system-phi.vercel.app

Bu sənəd repodakı frontend davranışını təsvir edir. Kodun mövcudluğu production
deployment-in, env-lərin və ya bütün inteqrasiyaların işlədiyinin təsdiqi deyil.
`docs/` daxilindəki əvvəlki mərhələ hesabatları tarixi qeydlərdir; cari endpoint
istifadəsi üçün `src/services/` və bu README əsas götürülməlidir.

## Lokal işə salma

Node.js 22.12+ və npm tələb olunur.

```sh
npm ci
```

`.env.example` faylını `.env` kimi kopyalayın və backend origin-ini yazın:

```dotenv
VITE_API_BASE_URL=https://your-backend.up.railway.app
VITE_PLATFORM_BASE_DOMAIN=
VITE_PUBLIC_SITE_MODE=
```

```sh
npm run dev
npm run lint
npm run build
npm run preview
```

Build nəticəsi `dist/` qovluğundadır. `preview` production server deyil.
Env dəyişiklikləri üçün dev server restartı və ya production rebuild lazımdır.

### Frontend env-ləri

| Dəyişən | Mənası |
| --- | --- |
| `VITE_API_BASE_URL` | Backend origin-i. Sonuna `/api` əlavə etməyin: sayt endpoint-ləri özləri `/api` prefiksi daşıyır. Boş olduqda real yazma əməliyyatları mümkün deyil. |
| `VITE_PLATFORM_BASE_DOMAIN` | Platformanın saytlar üçün baza domeni, məsələn `sites.example.com`. `https://`, path və wildcard yazılmır. |
| `VITE_PUBLIC_SITE_MODE` | Dashboard üçün boş saxlayın. Ayrıca istifadəçi-saytları deployment-ində `host` yazın. Aşağıdakı public hosting bölməsinə baxın. |
| `VITE_ENABLE_DEMO_AUTH` | Köhnə uyğunluq qeydi; `false` qalmalıdır. Demo giriş mövcud deyil. |

`VITE_` dəyişənləri brauzer bundle-ına daxil olur və public-dir. Backend
tokenləri, Brevo açarı, DB parolu və SSL provider açarı burada saxlanılmır.

## Cari inteqrasiya vəziyyəti

| Hissə | Frontend-in faktiki davranışı |
| --- | --- |
| Auth | Giriş, qeydiyyat, email təsdiqi və parol bərpası real API sorğuları göndərir. Demo hesab yoxdur. |
| Saytlar / şablonlar | `/api/sites` və `/api/templates` üzərindən işləyir. |
| Redaktor | Qaralama saytın `content` sahəsində GET/PUT ilə saxlanılır. Ayrı draft endpoint-i istifadə edilmir. |
| Domenlər | GET / PUT / verify / DELETE realdır. GET xətaları boş domen kimi gizlədilmir; təkrar yoxlama düyməsi var. |
| Platforma subdomeni | Mövcud saytın `slug` dəyəri göstərilir və ayrıca “Saxla” ilə PUT edilir. Bu əməliyyat DNS/hosting yaratmır və saytı yayımlamır. |
| Public sayt renderer-i | `host` rejimində backend-in yayımlanmış snapshot-u göstərilir. Dashboard və giriş ekranı göstərilmir. |
| Site Settings | Ümumi “Saxla” hazırda layihə adını saxlayır. Domen və slug ayrıca saxlanılır. Digər identity/SEO/privacy parametrləri üçün tam settings persistence yoxdur. |
| Deployment ekranları | `deploymentService.js` real sorğu adapteridir; endpoint uyğunluğu aşağıda qeyd olunub. |
| Redaktordakı Publish / Unpublish | `sitePublishService.js` hələ stub-dır və əməliyyatı rədd edir. Public renderer əlavə edilməsi bu düymələri aktivləşdirmir. |
| Formalar | Vizual quruluş və lokal validasiya var; `siteFormService.js` göndərişi rədd edir. Public saytda da form çatdırılması hazır deyil. |
| Media | Lokal blob/ön baxış qalıcı upload demək deyil. Public snapshot üçün əlçatan, qalıcı media URL-ləri lazımdır. |
| Billing / security / notifications / profile / admin | API adapterləri var; hər adapterin olması bütün backend endpoint-lərinin mövcudluğu və ya real ödəniş provayderi demək deyil. |
| Google OAuth | Frontend adapterləri var; backend provider axını ayrıca uyğunlaşdırılmalıdır. |

## HTTP və autentifikasiya müqaviləsi

`src/services/httpClient.js` URL-i `VITE_API_BASE_URL + path` kimi qurur.
JSON body üçün `Content-Type: application/json` göndərilir.
Multipart upload-da boundary-ni brauzer təyin edir.

- Qorunan sorğularda saxlanmış token `Authorization: Bearer <token>` ilə göndərilir.
- Sessiya `sessionStorage`, yaxud “remember me” seçiminə uyğun `localStorage`
  daxilində `managesystem-auth-session` açarı ilə saxlanılır.
- Public auth sorğuları və `{ anonymous: true }` sorğuları token göndərmir.
- Public sayt oxunması anonimdir; onun `401` cavabı dashboard sessiyasını silmir.
- Token daşıyan sorğu `401` qaytaranda sessiya təmizlənir və session-expired axını işləyir.
- Cross-origin cookie üçün `credentials: include` aktiv deyil; cari transport bearer-dir.
- Backend ownership, rol və plan limitlərini özü yoxlamalıdır.

## Sayt və redaktor API-si

Əsas yollar:

```text
GET    /api/templates
GET    /api/sites
POST   /api/sites
GET    /api/sites/{id}
PUT    /api/sites/{id}
DELETE /api/sites/{id}
```

Sayt yeniləməsində üç sahə birlikdə göndərilir:

```json
{
  "projectName": "Mənim saytım",
  "slug": "menim-saytim",
  "content": {
    "pages": []
  }
}
```

`content` nümunəsi yalnız envelope-u göstərir: real sorğuda redaktorun tam
sənədi (pages, sections, blocks, navigation, theme və digər sahələr) saxlanmalıdır.
Slug yazarkən frontend əvvəlcə cari saytı oxuyur və məzmunu qoruyaraq PUT edir.
Slug sahəsi DNS label-i üçün maksimum 63 simvol, kiçik latın hərfləri,
rəqəmlər və tək defislərlə məhdudlaşdırılır. Unikallıq backend-in qərarıdır.

## Domen API-si

```text
GET    /api/sites/{id}/domain
PUT    /api/sites/{id}/domain          body: { "hostname": "example.com" }
POST   /api/sites/{id}/domain/verify   body: {}
DELETE /api/sites/{id}/domain          success: 204
```

Frontend-in qəbul etdiyi cavab:

```json
{
  "hostname": "example.com",
  "status": "pending",
  "ssl": "pending",
  "records": [
    {
      "type": "TXT",
      "name": "_sitebuilder-verify.example.com",
      "value": "sitebuilder-verification=..."
    }
  ],
  "verifiedAt": null,
  "lastCheckedAt": null,
  "error": null
}
```

- `status`: `unconfigured | pending | connected | error`
- `ssl`: `unconfigured | pending | active | error`
- DNS növləri: `TXT`, `A`, `CNAME`; frontend serverin verdiyi qeydləri göstərir.
- Domen olmadıqda GET uğurlu `unconfigured` cavabı qaytarmalıdır.
  `403/404/405`, şəbəkə və server xətaları oxuma xətası kimi göstərilir.
- GET uğursuzdursa yazma düymələri bloklanır; “Yenidən cəhd et” ilə GET təkrarlanır.
- Plan bloklanması: `403` və `errors.code: ["CUSTOM_DOMAIN_NOT_ALLOWED"]`
  Azərbaycan/ingilis dilində plan mesajına çevrilir.
- `400` validasiya və digər yazma xətalarının backend mesajı göstərilir.
- TXT təsdiqi HTTPS-in hazır olması demək deyil. `connected` və aktiv olmayan
  SSL ayrıca izahla göstərilir. Frontend sertifikat yaratmır.

## Public saytların göstərilməsi

Eyni frontend kodunu **ayrıca public-site deployment-i** kimi build edin:

```dotenv
VITE_API_BASE_URL=https://your-backend.up.railway.app
VITE_PLATFORM_BASE_DOMAIN=sites.example.com
VITE_PUBLIC_SITE_MODE=host
```

Dashboard deployment-ində `VITE_PUBLIC_SITE_MODE` boş qalmalıdır; `host` bütün
path-ləri istifadəçi saytının səhifələri kimi qəbul edir.

Host seçimi:

| Brauzerdəki host | Anonim API sorğusu |
| --- | --- |
| `demo.sites.example.com` | `GET /api/public/sites/demo` |
| `customer.com` | `GET /api/public/sites/by-domain?host=customer.com` |

Platforma subdomeni yalnız baza domeninin birbaşa altındakı valid slug üçün
çıxarılır. Baza domeninin özü tenant sayılmır.

Backend cavabının renderer üçün tələb olunan hissəsi:

```json
{
  "siteId": "42",
  "slug": "demo",
  "projectName": "Demo",
  "version": 1,
  "publishedUrl": "https://demo.sites.example.com",
  "publishedAt": "...",
  "snapshot": {
    "site": {
      "content": {
        "pages": [
          { "id": "home", "name": "Home", "slug": "", "isHome": true, "sections": [] }
        ]
      }
    }
  }
}
```

Renderer yalnız `snapshot.site.content` istifadə edir; şəxsi draft endpoint-inə
müraciət etmir və boş snapshot-u şablonla əvəz etmir. `/` ana səhifəni,
`/about` uyğun page slug-ını göstərir. Daxili/xarici linklər normal brauzer
naviqasiyası ilə işləyir. Naməlum sayt/səhifə üçün tapılmadı ekranı,
şəbəkə/server xətası üçün təkrar cəhd göstərilir. Bu SPA-dır:
tapılmadı ekranı HTTP səviyyəsində SSR `404` deyil.

### Hosting tərəfinin ayrıca təmin etməli olduğu şərtlər

1. Custom domenlər və platforma wildcard DNS public-site deployment-inə yönəlməlidir.
2. Hosting provayderi həmin host-ları qəbul etməli və HTTPS sertifikatını təmin etməlidir.
   Backend-ə domen əlavə etmək Vercel-ə avtomatik domen əlavə etmək demək deyil.
3. Frontend deep link-ləri (`/about` və s.) `index.html`-ə SPA fallback almalıdır.
   Repodakı `vercel.json` bunu təmin edir.
4. Backend public endpoint-ləri visitor origin-ləri üçün CORS icazəsi verməlidir,
   yaxud ayrıca təsdiqlənmiş same-origin API proxy qurulmalıdır.
5. Backend-in `PUBLISHED_URL_TEMPLATE` dəyəri real public hosting ünvanına
   uyğunlaşdırılmalıdır, məsələn `https://{slug}.sites.example.com`.

## Backendçiyə açıq qalan məsələlər

Bu frontend dəyişiklikləri backend kodunu və Railway/Vercel env-lərini dəyişmir.
Araşdırılan backend kodunda:

- `LoggingSslProvisioner` sertifikat yaratmır, yalnız log yazır; SSL `pending`
  qalır. Real provisioner və ya hosting-provider inteqrasiyası ayrıca tələb olunur.
- Domen yoxlaması TXT sahibliyini təsdiqləyir; A/CNAME routing və HTTPS readiness
  bununla eyni şey deyil.
- `SiteDomainServiceImpl.isApex()` domeni nöqtə sayına görə təsnif edir.
  `example.co.uk` kimi kök domenlər üçün DNS record seçimi düzəldilməlidir.
- `SecurityConfig` CORS siyahısı dashboard, Railway və localhost origin-ləri ilə
  məhduddur; custom visitor domenləri üçün public API CORS işi qalır.
- `DOMAINS_CNAME_TARGET`, `DOMAINS_A_RECORDS`, `DOMAINS_PLATFORM_BASE_DOMAIN`
  real hosting arxitekturasına uyğun qurulmalıdır. Sonuncu frontend-in baza
  domeni ilə uyğun olmalıdır.
- STARTER planında custom-domain PUT üçün `403` gözlənilən plan qaydasıdır.
  Tam uğurlu domen sınağı üçün uyğun plan və idarə olunan real domen lazımdır.

### Digər endpoint uyğunluqları

Frontend bütün endpoint-lər üçün eyni prefiksdən istifadə etmir. Backend
marşrutlarını aşağıdakı faktiki çağırışlarla tutuşdurun:

| Adapter | İstifadə etdiyi yol |
| --- | --- |
| `authService` | `/auth/*` |
| `siteService`, `siteEditorService`, `siteDomainService` | `/api/sites/*` |
| `templateService` / şablon oxunması | `/api/templates` |
| `publicSiteService` | `/api/public/sites/*` |
| `deploymentService` | `/deployments/*`; sayt seçimi üçün `/sites` |
| `siteSettingsService` | GET `/sites/{id}/settings`; hazırda fallback. Yazma `/api/sites/{id}`. |
| `billingService` | `/billing/*` |
| `accountSecurityService` | `/account/security/*` |
| `notificationsService` | `/notifications/*` |
| `profileService` | `/profile`, `/profile/avatar` |
| `activityService` | `/activity`, `/usage`, `/usage/limits`; legacy workspace yolları da var |
| `adminPlatformService`, `usersService` | `/admin/*`, `/users/*` |

Məsələn, `/sites` və `/api/sites` avtomatik eyni yol deyil. Adapterin görünməsi
endpoint-in backend-də implementasiya olunduğu mənasına gəlmir.

## Kodun yerləşməsi və yoxlama

```text
src/components/   UI və redaktor renderer-ləri
src/pages/        Dashboard və public sayt ekranları
src/routes/       Dashboard route-ları və giriş qoruyucuları
src/services/     Faktiki HTTP adapterləri
src/models/       Normalizasiya və məlumat modelləri
src/i18n/         az / en mətnləri
src/styles/       CSS və mövzu stilləri
scripts/validation/  Brauzer smoke yoxlamaları və tarixi ssenarilər
```

Əsas yoxlamalar `npm run lint` və `npm run build`-dir. Domen/public renderer
dəyişiklikləri üçün mock API ilə brauzer sınağı:

```sh
node scripts/validation/domain-public-runtime-check.cjs
```

Skript lokal Vite və headless Chromium başladır; production məlumatına yazmır.
Chromium yolu fərqlidirsə `CHROMIUM_PATH` təyin edin. Mock sınağı real DNS, SSL,
CORS və production deployment-in end-to-end yoxlanmasını əvəz etmir.
