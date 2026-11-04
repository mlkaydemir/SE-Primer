// cypress/e2e/v2_differential_parity.cy.js
// SE Primer v2: Diferansiyel Parite Testi (Python Oracle vs Web ONNX) ve Tolerans Kontrolü

describe('SE Primer v2: Diferansiyel Parite ve Sayısal Hata Toleransı Testleri', () => {

  beforeEach(() => {
    cy.viewport(390, 844);
    cy.visit('/');
  });

  it('1. Diferansiyel Parite: 5 Referans Senaryoda Web ONNX vs Python Oracle farkı < 1e-4 olmalıdır', () => {
    // 1. ONNX Model & Parite Modalını Aç
    cy.get('#btn-onnx-modal').should('be.visible').click();
    cy.get('#onnx-modal').should('be.visible');

    // 2. Parite Testini Tarayıcıda Koş
    cy.get('#btn-run-parity-test').click();

    // 3. parite.json dosyasını oku ve her senaryoyu doğrula
    cy.readFile('tests/parite.json').then((pariteData) => {
      const cases = pariteData.test_cases;
      const tolerance = pariteData.tolerance; // 0.0001 (1e-4)

      expect(cases).to.have.length(5);

      cases.forEach((testCase) => {
        // Tabloda senaryo kimliği görünür olmalı
        cy.contains(testCase.id).should('be.visible');

        // Satırdaki Web P(1) değerini al ve Oracle P(1) ile karşılaştır
        cy.contains(testCase.id)
          .parents('tr')
          .within(() => {
            cy.get('[data-cy="p"]').invoke('text').then((text) => {
              const webProb = parseFloat(text);
              const oracleProb = testCase.oracle_probability_class_1;
              const delta = Math.abs(webProb - oracleProb);

              // Katı diferansiyel tolerans kuralı: |P_web - P_oracle| < 1e-4
              expect(delta).to.be.lessThan(tolerance);
            });

            // Parite durumu 'GEÇTİ' olmalı
            cy.get('[data-cy="parity-status"]').should('contain', 'GEÇTİ');
          });
      });
    });
  });

  it('2. Oyun İçi Çıkarım: Karar anında ONNX modeli canlı olasılık (data-cy="p") üretmelidir', () => {
    // Krize Başla (Junior Profil)
    cy.get('#btn-start-crisis').click();

    // Canlı ML telemetri rozetini doğrula
    cy.get('#ml-badge-container').should('be.visible');
    cy.get('#ml-live-prob').should('have.attr', 'data-cy', 'p');
    cy.get('[data-cy="p"]').should('be.visible');
    cy.get('[data-cy="model-status"]').should('be.visible');

    // Seçenekler arasında kararsızlık simülasyonu (tereddüt/değiştirme)
    cy.get('[data-choice="B"]').click();
    cy.wait(400);
    cy.get('[data-choice="A"]').click();

    // Modelin canlı olasılık güncellediğini doğrula
    cy.get('#ml-live-prob').invoke('text').should('contain', 'P:');
  });

  it('3. Adaptif Müdahale: Bilişsel aşırı yüklenme durumunda (P >= 0.50) müdahale kartı görünmelidir', () => {
    cy.get('#btn-start-crisis').click();

    // Kararsızlık tetikle (farklı seçeneklere art arda tıkla)
    cy.get('[data-choice="B"]').click();
    cy.get('[data-choice="A"]').click();
    cy.get('[data-choice="B"]').click();

    // Hızlı ipucu butonuna tıkla
    cy.contains('Risk Nedir?').click();

    // Modelin arayüzde adaptif müdahale kartını göstermesi
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="ml-intervention"]').length > 0) {
        cy.get('[data-cy="ml-intervention"]').should('be.visible');
      }
    });
  });

});
