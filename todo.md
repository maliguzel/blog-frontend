# 🚀 İçerik Otomasyonu ve Trend Blog Projesi — TODO.md

> Amaç: Google Trends → AI içerik → SEO trafik → otomatik büyüyen medya sistemi

---

# 🔥 FAZ 1 — Kritik Sistemler (İlk Öncelik)

## [x] 1. RSS Filtreleme ve Trend Temizleme

### Problem

Google Trends bazen:

- Arapça içerik
- Alakasız trend
- Emoji / boş içerik
- Çok kısa saçma sorgular

döndürüyor.

### Yapılacaklar

- [ ] Arapça unicode filtre
- [ ] Türkçe/Latin dışı içerik temizliği
- [ ] Emoji temizliği
- [ ] Boş slug koruması
- [ ] Çok kısa anlamsız trendleri ele

---

## [ ] 2. Trend Tipi Algılama Sistemi ⭐

### Problem

Her trend aynı değil:

```text
Novak Djokovic
Karaman hava durumu
Deprem
Altın fiyatları
Galatasaray Fenerbahçe
```

Hepsine aynı makale şablonu uygulanamaz.

### Yapılacaklar

- [ ] Gemini ile trend tipi belirleme
- [ ] Akıllı sınıflandırma sistemi

### Trend tipleri

```text
kisi
hava_durumu
spor
deprem
ekonomi
dizi_film
kurum_marka
teknoloji
genel_gundem
```

### İçerik davranışı

#### kişi

- Kimdir?
- Kaç yaşında?
- Kariyer
- Neden gündemde?

#### hava_durumu

- Bugün nasıl?
- Kaç derece?
- Yağış var mı?
- Haftalık tahmin

#### spor

- Son maç
- Puan durumu
- Hangi kanalda?
- Muhtemel 11

#### deprem

- Nerede oldu?
- Kaç büyüklüğünde?
- Son gelişmeler

---

## [ ] 3. İçerik Boş Dönme Koruması

### Yapılacaklar

- [ ] Minimum karakter kontrolü
- [ ] Retry mekanizması
- [ ] Gemini response validasyonu
- [ ] Başarısız üretimleri logla

### Kural

```python
if len(text) < 500:
    retry()
```

---

## [ ] 4. Hata Loglama Sistemi

### Amaç

Başarısız trendleri izlemek.

### Yapılacaklar

- [ ] `error.log` sistemi
- [ ] Başarısız trend adı
- [ ] Exception detayı
- [ ] Timestamp ekleme

Örnek:

```text
2026-05-27 15:23
Trend: Novak Djokovic
Hata: Gemini boş response
```

---

## [ ] 5. TOC (İçindekiler) Sistemi ⭐

### Amaç

- Uzun makalelerde UX artırmak
- SEO snippet kazanmak
- Hızlı gezinme sağlamak

### Yapılacaklar

- [ ] `##` markdown başlıklarını çek
- [ ] Tıklanabilir TOC
- [ ] Scroll anchor sistemi
- [ ] Sticky mini navigation

### Prompt kuralı

```text
Makale içinde minimum 3 adet ## alt başlık kullan.
```

---

# 🚀 FAZ 2 — SEO İçerik Motoru

## [ ] 6. Akıllı Yardımcı SEO Sayfaları ⭐⭐⭐

### Amaç

Tek trend → çoklu trafik

---

### kişi örneği

```text
novak-djokovic
novak-djokovic-kimdir
novak-djokovic-kac-yasinda
novak-djokovic-son-maci
```

---

### hava durumu örneği

```text
karaman-hava-durumu
karaman-hava-durumu-yarin
karaman-5-gunluk-hava-durumu
karaman-yagis-var-mi
```

---

### spor örneği

```text
galatasaray-fenerbahce
galatasaray-fenerbahce-ne-zaman
galatasaray-fenerbahce-hangi-kanalda
galatasaray-fenerbahce-muhtemel-11
```

### Yapılacaklar

- [ ] Trend tipine göre SEO planı
- [ ] Yardımcı makale üretici
- [ ] Duplicate engeli
- [ ] Günlük limit sistemi
- [ ] Aynı görseli reuse et

---

## [ ] 7. Dinamik SEO Güçlendirme

### Yapılacaklar

- [ ] Metadata API geliştirme
- [ ] OpenGraph iyileştirme
- [ ] Twitter Card
- [ ] Canonical URL
- [ ] Dynamic title/description

---

## [ ] 8. Schema Markup Sistemi

### Yapılacaklar

- [ ] FAQ Schema
- [ ] Breadcrumb Schema
- [ ] NewsArticle Schema

### Amaç

Google rich result kazanmak.

---

## [ ] 9. Otomatik FAQ Sistemi

### Makale altında otomatik üret

Örnek:

```text
Novak Djokovic kaç yaşında?
Novak Djokovic neden gündemde?
Novak Djokovic son maçı kaç kaç bitti?
```

### Yapılacaklar

- [ ] Gemini FAQ üretici
- [ ] JSON-LD schema ekleme

---

## [ ] 10. Duplicate Content Koruması

### Problem

Benzer trendlerde aynı içerik oluşabilir.

### Yapılacaklar

- [ ] Similarity check
- [ ] Aynı makaleyi tekrar üretmeme
- [ ] Update existing article sistemi

---

# 🎨 FAZ 3 — Frontend Geliştirmeleri

## [ ] 11. Kategori Menüsü

### Ana sayfa filtreleme

- [ ] Teknoloji
- [ ] Ekonomi
- [ ] Spor
- [ ] Sağlık
- [ ] Eğlence

---

## [ ] 12. En Çok Okunanlar Bölümü ⭐

### Ana sayfa modülü

```text
🔥 En Çok Okunanlar
```

### Firebase sorgusu

```ts
orderBy("okunma_sayisi", "desc");
limit(5);
```

---

## [ ] 13. Trend Ticker

### Header altı

```text
🔥 Novak Djokovic
🔥 Karaman hava durumu
🔥 Bölgesel Amatör Lig
```

### Özellik

Tıklanabilir trend barı.

---

## [ ] 14. Son Dakika Rozeti

### Yeni trendlerde

```text
SON DAKİKA
```

CTR artırır.

---

## [ ] 15. Benzer İçerikler Sistemi

### Şu an

Kategori bazlı.

### Hedef

Kategori + benzer konu

Örnek:

```text
Novak Djokovic
Carlos Alcaraz
ATP sıralaması
Roland Garros
```

---

## [ ] 16. Okuma Sayacı

### Yapılacaklar

- [ ] `increment(1)`
- [ ] Bot koruması
- [ ] Unique session mantığı

---

## [ ] 17. Next/Image Optimizasyonu

### Yapılacaklar

- [ ] Görselleri optimize et
- [ ] blur placeholder
- [ ] lazy loading

---

# 🔍 FAZ 4 — SEO ve Google Dostu Site

## [ ] 18. Sitemap Güçlendirme

### Yapılacaklar

- [ ] Firebase sitemap
- [ ] Priority sistemi
- [ ] Trend makalelere öncelik

```text
500+ okunma → 0.95
100+ okunma → 0.85
Yeni → 0.75
```

---

## [ ] 19. Robots + Canonical Düzeltme

### .env

```env
NEXT_PUBLIC_SITE_URL=https://siteadresi.com
```

---

## [ ] 20. IndexNow Entegrasyonu ⭐

### Amaç

Makale yayınlanır yayınlanmaz Google/Bing bildirimi.

### Yapılacaklar

- [ ] IndexNow fonksiyonu
- [ ] Makale sonrası otomatik ping

API:

```text
api.indexnow.org
```

---

## [ ] 21. Google Search Console

### Yapılacaklar

- [ ] Site doğrulama
- [ ] sitemap.xml ekleme
- [ ] coverage error takibi

---

## [ ] 22. Analytics

### Yapılacaklar

- [ ] Google Analytics
      veya
- [ ] Vercel Analytics

### Amaç

Hangi trend çalışıyor görmek.

---

# ☁️ FAZ 5 — Deploy ve Altyapı

## [ ] 23. GitHub Repo

### Yapılacaklar

- [ ] Private repo
- [ ] .gitignore kontrolü
- [ ] Firebase key gizleme

---

## [ ] 24. Vercel Deploy

### Yapılacaklar

- [ ] Auto deploy
- [ ] `git push` ile update

---

## [ ] 25. Environment Variables

### Vercel env

```env
GEMINI_API_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_SITE_URL
```

---

## [ ] 26. Google Cloud Functions ⭐

### Amaç

Python script 7/24 otomatik çalışsın.

### Yapılacaklar

- [ ] Scheduler
- [ ] Cron trigger
- [ ] Auto trend fetch

---

# 📧 FAZ 6 — İleri Seviye

## [ ] 27. Newsletter

### Firebase collection

- [ ] email listesi
- [ ] abonelik formu

---

## [ ] 28. Admin Panel

### Özellikler

- [ ] trend onayla
- [ ] blacklist
- [ ] yayından kaldır
- [ ] öne çıkar
- [ ] manuel edit

---

## [ ] 29. Otomatik Sosyal Medya

### Makale yayınlanınca

- [ ] X
- [ ] Facebook
- [ ] Telegram

otomatik paylaş.

---

# 📅 7 Günlük Yol Haritası

### Gün 1

- [ ] RSS filtreleme
- [ ] hata loglama
- [ ] içerik boş dönme koruması

### Gün 2

- [ ] TOC sistemi
- [ ] markdown standardı

### Gün 3

- [ ] trend tipi algılama

### Gün 4

- [ ] yardımcı SEO sayfaları

### Gün 5

- [ ] schema + FAQ

### Gün 6

- [ ] en çok okunanlar
- [ ] trend ticker
- [ ] son dakika etiketi

### Gün 7

- [ ] IndexNow
- [ ] Search Console
- [ ] Analytics
