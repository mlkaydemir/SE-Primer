// cypress/e2e/se_primer_all_paths.cy.js
// YZM301 · SE Primer E2E Test Paketi (Tüm Yollar + Sokratik Tutor + Senior Stres Modu)

describe('SE Primer: Kişiselleştirilmiş Kriz Simülasyonu E2E Testleri', () => {

  beforeEach(() => {
    // Her testten önce mobil viewport (iPhone 14/15 390x844) ayarlanır
    cy.viewport(390, 844);
    cy.visit('/');
  });

  it('1. Onboarding ve Kişiselleştirme: Junior ve Senior modları yapılandırılabilmelidir', () => {
    cy.contains('SE Primer').should('be.visible');
    cy.contains('1. Seviye Seçimi').should('be.visible');

    // Varsayılan olarak Junior modu seçilidir
    cy.contains('Yeni Başladım (Jr)').should('be.visible');
    cy.contains('Junior Modu Seçildi').should('be.visible');

    // Senior moduna geçiş testi
    cy.get('[data-val="senior"]').click();
    cy.contains('Senior Modu Seçildi').should('be.visible');
    cy.contains('60 saniyelik stres zamanlayıcısı').should('be.visible');

    // Rol değişimi: DevOps seç
    cy.get('[data-val="devops"]').click();
    cy.get('[data-val="devops"]').should('have.class', 'selected');

    // Hedef değişimi: Hız seç
    cy.get('[data-val="speed"]').click();
    cy.get('[data-val="speed"]').should('have.class', 'selected');
  });

  it('2. Yol A-A-A (Altın Yol): Rollback -> Smoke Test -> Maskeleme ile SON A (İyi Son) elde edilmelidir', () => {
    // Junior modunda başla
    cy.get('[data-val="junior"]').click();
    cy.get('#btn-start-crisis').click();

    // KARAR 1 · MİMARİ
    cy.contains('KARAR 1 · MİMARİ').should('be.visible');
    cy.contains('300 HASTA').should('be.visible');
    
    // A) Eski sürüme geri dön seç
    cy.get('[data-choice="A"]').click();
    cy.contains('TEKNİK GERİ BİLDİRİM').should('be.visible');
    cy.contains('Kararlı olan v1.4 sürümüne geri dönme').should('be.visible');
    cy.contains('Bilinmeyen hatayı ayıklamak yerine').should('be.visible');

    // Sonraki karara ilerle
    cy.get('#btn-next-step').click();

    // KARAR 2 · TEST & DOĞRULAMA
    cy.contains('KARAR 2 · TEST & DOĞRULAMA').should('be.visible');
    
    // A) Önce kısa test koş seç
    cy.get('[data-choice="A"]').click();
    cy.contains('Otomasyonlu smoke test suite çalıştırıldı').should('be.visible');
    cy.contains('fail-fast').should('be.visible');

    // Sonraki karara ilerle
    cy.get('#btn-next-step').click();

    // KARAR 3 · KVKK & VERİ GİZLİLİĞİ
    cy.contains('KARAR 3 · KVKK & VERİ GİZLİLİĞİ').should('be.visible');
    cy.contains('Ahmet Yılmaz').should('be.visible');

    // A) Maskele seç
    cy.get('[data-choice="A"]').click();
    cy.contains('Loglar regex filtresinden geçirildi').should('be.visible');
    cy.contains('6698 sayılı').should('be.visible');

    // Raporu gör
    cy.get('#btn-next-step').click();

    // SONUÇ EKRANI: SON A Doğrulaması
    cy.contains('SON A · İYİ SON').should('be.visible');
    cy.contains('08:25 · Sistem Ayakta, Veri Güvende!').should('be.visible');
    cy.contains('300 / 300').should('be.visible');
    cy.contains('100 / 100').should('be.visible');
    cy.contains('0 TL').should('be.visible');
  });

  it('3. Yol A-A-B (KVKK Felaketi): Rollback -> Smoke Test -> Ham Log ile SON B (Kötü Son) elde edilmelidir', () => {
    cy.get('#btn-start-crisis').click();

    // Karar 1: A
    cy.get('[data-choice="A"]').click();
    cy.get('#btn-next-step').click();

    // Karar 2: A
    cy.get('[data-choice="A"]').click();
    cy.get('#btn-next-step').click();

    // Karar 3: B (Ekibe olduğu gibi at - KVKK İhlali)
    cy.get('[data-choice="B"]').click();
    cy.contains('Ham log metni 80 kişilik genel teknik kanala').should('be.visible');
    cy.get('#btn-next-step').click();

    // SON B Doğrulaması
    cy.contains('SON B · KÖTÜ SON').should('be.visible');
    cy.contains('Sistem Ayakta ama KVKK İhlali!').should('be.visible');
    cy.contains('0 / 100 (İHLAL)').should('be.visible');
    cy.contains('2.500.000 TL').should('be.visible');
  });

  it('4. Yol B-B-B (Kovboy Kodlama): Canlıda Yama -> Sıfır Test -> Ham Log ile SON C elde edilmelidir', () => {
    cy.get('#btn-start-crisis').click();

    // Karar 1: B (Canlıda yama yap)
    cy.get('[data-choice="B"]').click();
    cy.contains('table lock').should('be.visible');
    cy.get('#btn-next-step').click();

    // Karar 2: B (Hemen yayına al)
    cy.get('[data-choice="B"]').click();
    cy.contains('502 Bad Gateway').should('exist');
    cy.get('#btn-next-step').click();

    // Karar 3: B (Ham log at)
    cy.get('[data-choice="B"]').click();
    cy.get('#btn-next-step').click();

    // SON C veya Felaket Çöküş Doğrulaması
    cy.contains('SON C · KRİTİK ÇÖKÜŞ').should('be.visible');
    cy.contains('Veritabanı Kilitlendi').should('be.visible');
  });

  it('5. Sokratik AI Tutor: Öğrenci soru sorduğunda cevabı ele vermemeli, Sokratik karşı soru sormalıdır', () => {
    cy.get('#btn-start-crisis').click();

    // Sokratik AI Paneli görünür olmalı
    cy.contains('AI TUTOR (SOKRATİK DANIŞMAN)').should('be.visible');
    cy.contains('Cevabı ele vermez').should('be.visible');

    // Öğrenci doğrudan cevap istesin:
    cy.get('#tutor-input').type('A şıkkını mı seçeyim B yi mi? Hangisi doğru?');
    cy.get('#btn-ask-tutor').click();

    // AI Tutor cevabı kontrol edilir:
    cy.get('#tutor-chat-box').within(() => {
      // Cevabı doğrudan ele vermediğinin kontrolü:
      cy.should('not.contain', 'A şıkkını seç');
      cy.should('not.contain', 'B şıkkını seç');
      cy.should('not.contain', 'Doğru cevap A');
      
      // Sokratik soru içerdiğinin kontrolü:
      cy.contains('veritabanı şemasının').should('be.visible');
    });

    // Hazır ipucu hapına tıklama testi
    cy.contains('DB Riski?').click();
    cy.get('#tutor-chat-box').should('contain', 'veritabanı');
  });

  it('6. Senior Stres Modu: 60 saniyelik geri sayım sayacı çalışmalıdır', () => {
    // Senior seç
    cy.get('[data-val="senior"]').click();
    cy.get('#btn-start-crisis').click();

    // Zamanlayıcı görünmeli ve azalmalıdır
    cy.get('#telemetry-timer').should('be.visible');
    cy.get('#stress-timer-bar').should('be.visible');
    cy.get('#telemetry-timer').contains('60s');
    
    // 2 saniye bekle, sayacın azaldığını doğrula
    cy.wait(2000);
    cy.get('#telemetry-timer').invoke('text').then((text) => {
      const seconds = parseInt(text.replace(/[^0-9]/g, ''));
      expect(seconds).to.be.lessThan(60);
    });
  });

});

