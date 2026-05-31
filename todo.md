# 🚀 İçerik Otomasyonu ve Trend Blog Projesi — TODO.md

> Amaç: Google Trends → AI içerik → SEO trafik → otomatik büyüyen medya sistemi

**Durum açıklaması:** `✅ kodda mevcut` = mevcut kodda çalışıyor ·
`🔧 kısmen` = temeli var, eksik tarafı işaretli · `🆕` = kod incelemesinden eklenen yeni madde

---

# 🔥 FAZ 1 — Kritik Sistemler (İlk Öncelik)

## [x] 1. RSS Filtreleme ve Trend Temizleme — ✅ kodda mevcut

Google Trends bazen Arapça içerik, alakasız trend, emoji/boş içerik, çok kısa sorgu döndürüyor.

- [x] Arapça/Latin dışı unicode filtre — `turkce_mi()`
- [x] Türkçe/Latin dışı içerik temizliği — `turkce_mi()`
- [x] Emoji temizliği — `re.sub` ile `create_slug` / `turkce_mi`
- [x] Boş slug koruması — `create_slug` (min uzunluk + fallback)
- [x] Çok kısa anlamsız trendleri ele — `turkce_mi` uzunluk kontrolü

---

## [x] 2. Trend Tipi Algılama Sistemi ⭐ — ✅ kodda mevcut

Her trende aynı şablon uygulanamaz (Djokovic vs hava durumu vs deprem vs altın).

- [x] Gemini ile trend tipi belirleme — `detect_trend_type()`
- [x] Akıllı sınıflandırma — `TREND_TIPLERI` + `tip_format_kurallari()`
- [x] Tipe özel içerik davranışı (kişi / hava / spor / deprem / ekonomi …)
- [x] Tipe özel gerçek zamanlı veri çekme — `fetch_guncel_baglam()`
      (hava → wttr.in, deprem → USGS, ekonomi → döviz, haber → Google News RSS)

---

## [x] 3. İçerik Boş Dönme Koruması — ✅ kodda mevcut

- [x] Minimum karakter kontrolü — `MIN_MAKALE_KARAKTER`
- [x] Retry mekanizması — `generate_with_retry()`
- [x] Gemini response validasyonu — uzunluk + `safe_json_parse`
- [x] Başarısız üretimleri logla — `log_error()`
- [ ] 🆕 **Safety-block ayrımı:** Gemini içeriği bloklarsa candidate dönmez,
      `response.text` patlar. `response.candidates` kontrolü ekle → log'da
      "blocked" mı "network" mü ayırt et (hata ayıklama kolaylaşır)

---

## [x] 4. Hata Loglama Sistemi — ✅ kodda mevcut

- [x] `logs/error.log` sistemi — `log_error()`
- [x] Başarısız trend adı + Exception detayı + Timestamp

---

## [ ] 5. TOC (İçindekiler) Sistemi ⭐ — 🔧 kısmen

- [x] `##` markdown başlıklarını çek — `icerik_basliklari_cikar()` (`icerikler` alanı)
- [x] Prompt'ta minimum başlık kuralı — "minimum 4 adet ## alt başlık"
- [ ] Tıklanabilir TOC bileşeni (frontend)
- [ ] Scroll anchor sistemi (anchor id'leri `create_slug` ile eşleştir)
- [ ] Sticky mini navigation

---

# 🚀 FAZ 2 — SEO İçerik Motoru

## [ ] 6. Akıllı Yardımcı SEO Sayfaları ⭐⭐⭐

Tek trend → çoklu trafik. (ör. `novak-djokovic`, `-kimdir`, `-kac-yasinda`, `-son-maci`)

- [ ] Trend tipine göre SEO planı (her tip için alt-soru şablonları)
- [ ] Yardımcı makale üretici
- [ ] Duplicate engeli
- [ ] Günlük limit sistemi
- [ ] Aynı görseli reuse et (maliyet tasarrufu)

---

## [ ] 7. Dinamik SEO Güçlendirme — 🔧 kısmen

- [x] Temel metadata + OpenGraph (`layout.tsx` — siteName, locale, template)
- [ ] 🆕 **`metadataBase` ayarla** — yoksa OG/canonical göreli URL'ler uyarı verir,
      bazı platformlar görseli çekmez
- [ ] **Dinamik OG görseli** — `route.tsx` şu an her sayfaya statik "Nedir Bunlar"
      basıyor. `opengraph-image.tsx`'e taşı, `ImageResponse` içine makale başlığı +
      kategori dinamik bas
- [ ] Twitter Card metadata
- [ ] Canonical URL (her makale + kategori sayfası)
- [ ] Dynamic title/description (makale `generateMetadata`)

---

## [ ] 8. Schema Markup Sistemi ⭐

Google rich result kazanmak için. (Önerimdeki "JSON-LD" maddesi buraya denk geliyor.)

- [ ] **NewsArticle / Article Schema** — `headline`, `datePublished`, `dateModified`,
      `image`, `author` alanları Firestore'da zaten var → `<script type="application/ld+json">`
- [ ] FAQ Schema (madde 9 ile birlikte)
- [ ] Breadcrumb Schema (kategori sayfaları ile birlikte)

---

## [ ] 9. Otomatik FAQ Sistemi

Makale altında otomatik üret (ör. "Novak Djokovic kaç yaşında?", "neden gündemde?").

- [ ] Gemini FAQ üretici (mevcut makale prompt'una ek JSON çıktısı olarak alınabilir)
- [ ] FAQPage JSON-LD schema ekleme

---

## [ ] 10. Duplicate Content Koruması — 🔧 kısmen

- [x] Slug + trend_hash ile temel tekrar kontrolü — `makale_zaten_var_mi()`
- [ ] 🆕 **Skip yerine UPDATE:** Aynı konu birkaç gün trend olabilir. Var olan
      makaleyi yeni `zengin_baglam` ile güncelle, `guncelleme_tarihi`'ni tazele
      → SEO tazeliği yeni makaleden değerli
- [ ] Similarity check (yakın trendlerde içerik benzerliği)

---

# 🎨 FAZ 3 — Frontend Geliştirmeleri

## [x] 11. Kategori Menüsü — ✅ kodda mevcut

- [x] Filtreleme — `MakaleFiltreleri.tsx` (kategori pilleri + arama + sıralama + debounce)
- [ ] 🆕 **Gerçek kategori route'ları** `/kategori/[slug]` — şu an filtre query param
      ile (`?kategori=Spor`), `KategoriBadge` hiçbir yere link vermiyor. Query param
      sayfaları zayıf indekslenir; ayrı route'lar her kategoriyi indekslenebilir
      landing page yapar (sitemap'e de ekle)

---

## [ ] 12. En Çok Okunanlar Bölümü ⭐ — 🔧 kısmen

- [x] "Popüler" sıralaması mevcut — `orderBy("okunma_sayisi", "desc")`
- [ ] Ana sayfada ayrı "🔥 En Çok Okunanlar" modülü (`limit(5)`)

---

## [ ] 13. Trend Ticker

- [ ] Header altı tıklanabilir trend barı

---

## [ ] 14. Son Dakika Rozeti

- [ ] Yeni trendlerde "SON DAKİKA" etiketi (CTR artırır)

---

## [ ] 15. Benzer İçerikler Sistemi (İç Linkleme) ⭐ — 🆕 yüksek SEO etkisi

Şu an makaleler birbirine hiç link vermiyor — büyük SEO kaybı.

- [ ] Otomasyonda kayıt anında aynı kategoriden 2-3 "ilgili makale" referansı tut
- [ ] Makale altında göster (link juice + dwell time)
- [ ] Hedef: kategori + benzer konu (Djokovic → Alcaraz → ATP sıralaması → Roland Garros)

---

## [x] 16. Okuma Sayacı — 🔧 kısmen (güvenlik açığı var)

- [x] `increment(1)` — `ReadCounter.tsx`
- [ ] 🆕 **Sunucuya taşı (GÜVENLİK):** İstemci doğrudan `updateDoc(increment(1))`
      çağırıyor → Firestore kuralları `okunma_sayisi`'na herkese yazma izni
      gerektiriyor, kötüye açık. `/api/view` route handler aç, `adminDb` ile artır
- [ ] Bot koruması + IP/cookie throttle
- [ ] Unique session mantığı (her sayfa yenilemesi yeni sayım sorununu çöz)

---

## [ ] 17. Next/Image Optimizasyonu — 🔧 kısmen

- [x] `next/image` kullanımı + `sizes` + `priority` (öne çıkan kart) — `page.tsx`
- [ ] blur placeholder (`placeholder="blur"`)
- [ ] `remotePatterns` kontrolü (Unsplash / Pexels / Wikipedia domainleri)

---

# 🔍 FAZ 4 — SEO ve Google Dostu Site

## [x] 18. Sitemap Güçlendirme — 🔧 kısmen

- [x] Firebase sitemap — `sitemap.ts`
- [ ] Priority sistemi (500+ okunma → 0.95, 100+ → 0.85, yeni → 0.75)
- [ ] 🆕 **Admin SDK'ya geçir:** `sitemap.ts` client SDK (`firebase/firestore`)
      kullanıyor, `page.tsx` ise `adminDb` → tutarsız. Sunucuda admin SDK
      kuralları etkilemeden okur

---

## [x] 19. Robots + Canonical Düzeltme — 🔧 kısmen

- [x] `robots.ts` + `NEXT_PUBLIC_SITE_URL` env
- [ ] Canonical URL'ler (madde 7 ile birlikte)

---

## [x] 20. IndexNow Entegrasyonu ⭐ — ✅ kodda mevcut

- [x] IndexNow fonksiyonu — `ping_indexnow()`
- [x] Makale sonrası otomatik ping — `main()` içinde

---

## [ ] 21. Google Search Console

- [ ] Site doğrulama
- [ ] sitemap.xml ekleme
- [ ] coverage error takibi

---

## [ ] 22. Analytics

- [ ] Google Analytics veya Vercel Analytics
- [ ] Amaç: hangi trend çalışıyor görmek

---

# ⚡ FAZ 4.5 — Performans & Maliyet (🆕 yeni faz)

Kod incelemesinden çıkan, listede olmayan ama site büyüdükçe kritikleşen maddeler.

## [ ] 23. ISR / Cache 🆕 ⭐

- [ ] Anasayfa tamamen dinamik → her ziyaret Firestore okuması
- [ ] Filtresiz anasayfa + makale sayfalarına `export const revalidate = 600`
- [ ] Otomasyon yeni makale basınca `revalidatePath` ile tetikle

## [ ] 24. Firestore Okuma Maliyeti 🆕

- [ ] **Arama:** `getMakaleler` arama yapınca TÜM koleksiyonu çekip Node'da
      filtreliyor (2000 makale = 2000 okuma/arama). `arama_kelimeleri` array alanı +
      `array-contains`, ya da büyürse Algolia/Typesense
- [ ] **Pagination:** N. sayfa için `(sayfa-1)*12` doküman okuyor (offset problemi).
      Son dokümanın tarihini URL'ye gömüp `startAfter` ile cursor pagination

## [ ] 25. Gemini Maliyet Optimizasyonu 🆕

- [ ] **Çağrıları birleştir:** `detect_trend_type` + `generate_article_metadata`
      iki ayrı Flash çağrısı → tek prompt'ta JSON olarak ikisini birden iste
      (maliyet/gecikme yarıya iner)
- [ ] **Grounding kaynakları:** `gemini_text_with_search` arama yapıyor ama
      `grounding_metadata` kaynak URL'leri atılıyor. Makale altına "Kaynaklar"
      olarak bas → güven + E-E-A-T sinyali

## [ ] 26. FOUC (Tema Titremesi) Düzelt 🆕

- [ ] `ThemeToggle` temayı `useEffect`'te uyguluyor → kayıtlı "dark", sistemi açık
      kullanıcıda ilk boyamada titreme. `<head>`'e blocking inline script koy,
      class'ı boyamadan önce ekle

---

# ☁️ FAZ 5 — Deploy ve Altyapı

## [ ] 27. GitHub Repo

- [ ] Private repo · .gitignore kontrolü · Firebase key gizleme (`firebase-key.json` asla commit'lenmesin)

## [ ] 28. Vercel Deploy

- [ ] Auto deploy · `git push` ile update

## [ ] 29. Environment Variables

- [ ] Vercel env: `GEMINI_API_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_SITE_URL`,
      `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`, `INDEXNOW_KEY`, `FIREBASE_KEY_PATH`

## [ ] 30. Google Cloud Functions / Scheduler ⭐

- [ ] Python script 7/24 otomatik çalışsın
- [ ] Scheduler + Cron trigger + Auto trend fetch
      (alternatif: GitHub Actions cron — daha basit/ücretsiz başlangıç)

---

# 📧 FAZ 6 — İleri Seviye

## [ ] 31. Newsletter

- [ ] Firebase collection: email listesi · abonelik formu

## [ ] 32. Admin Panel

- [ ] trend onayla · blacklist · yayından kaldır · öne çıkar · manuel edit

## [ ] 33. Otomatik Sosyal Medya

- [ ] Makale yayınlanınca X / Facebook / Telegram otomatik paylaş

---

# 📅 7 Günlük Yol Haritası (güncellenmiş)

FAZ 1 büyük ölçüde bitmiş durumda — odak artık SEO derinliği, maliyet ve frontend.

### Gün 1 — SEO temelleri (en yüksek trafik etkisi)

- [ ] NewsArticle JSON-LD schema (madde 8)
- [ ] metadataBase + canonical + Twitter Card (madde 7)

### Gün 2 — Dinamik sosyal + kategori

- [ ] Dinamik OG görseli (madde 7)
- [ ] `/kategori/[slug]` route'ları (madde 11)

### Gün 3 — İç linkleme & ilgili içerik

- [ ] Benzer içerikler / iç linkleme (madde 15)
- [ ] En çok okunanlar modülü (madde 12)

### Gün 4 — Performans & maliyet

- [ ] ISR / revalidate (madde 23)
- [ ] Okuma sayacını /api'ye taşı (madde 16)

### Gün 5 — Yardımcı SEO sayfaları

- [ ] Trend tipine göre yardımcı sayfa üretici (madde 6)
- [ ] Otomatik FAQ + FAQ schema (madde 9)

### Gün 6 — Otomasyon kalitesi

- [ ] Skip yerine update (madde 10)
- [ ] Gemini çağrı birleştirme + grounding kaynakları (madde 25)

### Gün 7 — Ölçüm & altyapı

- [ ] Search Console + Analytics (madde 21, 22)
- [ ] Cloud Functions / Scheduler ile 7/24 çalıştırma (madde 30)
