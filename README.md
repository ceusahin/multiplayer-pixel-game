# Çok Oyunculu Piksel Oyunu PRD

## Ürün Özeti

Çok oyunculu, gerçek zamanlı bir piksel sanat oyunu. Kullanıcılar 12 farklı renk arasından seçim yaparak ortak bir tuval üzerinde piksel yerleştirebilirler.

## Temel Özellikler

### Kullanıcı Arayüzü

- Merkezi bir piksel tuval
- 12 renkli bir renk paleti
- Aktif kullanıcı sayısı göstergesi
- Yakınlaştırma/uzaklaştırma kontrolleri
- Son yerleştirilen piksellerin geçmişi

### Oyun Mekanikleri

- Her kullanıcı tek seferde bir piksel yerleştirebilir
- Piksel yerleştirme için bekleme süresi: 30 saniye
- Tuvalde yakınlaştırma/uzaklaştırma yapılabilir
- Tuval boyutu: 1000x1000 piksel

### Teknik Özellikler

#### Backend (Node.js/Express.js)

- Piksel verilerinin MongoDB'de depolanması
- Kullanıcı oturum yönetimi

#### Frontend (Web Uygulaması)

- Canvas API kullanarak piksel renderlaması
- Responsive tasarım
- WebSocket client entegrasyonu
- Renk seçici arayüzü

## Teknik Gereksinimler

### Backend Bağımlılıkları

- Node.js
- Express.js
- Socket.io
- MongoDB
- JWT için jsonwebtoken

### Frontend Bağımlılıkları

- React.js
- Socket.io-client
- TailwindCSS
- Canvas API

## API Endpoints

### REST API

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/canvas` - Mevcut tuval durumunu al
- `POST /api/pixel` - Piksel yerleştir

### WebSocket Events

- `pixel:update` - Yeni piksel yerleştirildiğinde
- `user:connect` - Kullanıcı bağlandığında
- `user:disconnect` - Kullanıcı ayrıldığında
- `canvas:sync` - Tuval senkronizasyonu

## Güvenlik Gereksinimleri

- Rate limiting: Her kullanıcı 30 saniyede bir piksel yerleştirebilir
- JWT tabanlı kimlik doğrulama
- WebSocket bağlantıları için token doğrulama
- XSS ve CSRF koruması

## Performans Gereksinimleri

- Maksimum WebSocket latency: 100ms
- Sayfa yüklenme süresi: < 3 saniye
- Canvas render performansı: 60 FPS
- Eşzamanlı kullanıcı desteği: 1000+

## Gelecek Özellikler (v2)

- Kullanıcı profilleri
- Piksel istatistikleri
- Topluluk challenge'ları
- Özel tuval odaları
