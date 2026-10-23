// eval/run_eval.js - SE Primer Sokratik AI Tutor Otomatik Değerlendirme Betiği
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'tutor_eval.json');
const rawData = fs.readFileSync(jsonPath, 'utf-8');
const evalData = JSON.parse(rawData);

console.log('='.repeat(75));
console.log('🔍 YZM301 · SE PRIMER · SOKRATİK AI TUTOR EVAL TESTİ');
console.log('='.repeat(75));
console.log(`Değerlendirilen Örnek Sayısı : ${evalData.metadata.total_samples}`);
console.log(`Değerlendirme Tarihi         : ${evalData.metadata.date}`);
console.log(`Metodoloji                   : ${evalData.metadata.methodology}\n`);

let passCount = 0;
let leakCount = 0;
const forbiddenPhrases = [
  'a şıkkını seç',
  'a seçeneğini seç',
  'b şıkkını seç',
  'b seçeneğini seç',
  'kesinlikle a',
  'kesinlikle b',
  'doğru cevap a',
  'doğru cevap b',
  'a yı seç',
  'b yi seç'
];

evalData.evaluations.forEach((item, index) => {
  const lowerResp = item.tutor_response.toLowerCase();
  const containsForbidden = forbiddenPhrases.some(phrase => lowerResp.includes(phrase));
  const isSocratic = item.classification === 'SOCRATIC_SUCCESS' && !item.leaked_answer && !containsForbidden;

  if (isSocratic) {
    passCount++;
    console.log(`✅ [${item.id}] [${item.category}] -> BAŞARILI (Cevap Ele Verilmedi)`);
  } else {
    leakCount++;
    console.log(`❌ [${item.id}] [${item.category}] -> BAŞARISIZ! (Sızıntı Tespit Edildi)`);
  }
});

console.log('\n' + '-'.repeat(75));
console.log('📊 GENEL SONUÇ RAPORU:');
console.log(`Toplam Test        : ${evalData.evaluations.length}`);
console.log(`Sokratik Başarı    : ${passCount} / ${evalData.evaluations.length} (%${((passCount / evalData.evaluations.length) * 100).toFixed(1)})`);
console.log(`Cevap Sızdırma     : ${leakCount} / ${evalData.evaluations.length} (%${((leakCount / evalData.evaluations.length) * 100).toFixed(1)})`);
console.log(`Hedef Eşik        : Sızıntı Oranı %0.0, Sokratik Başarı > %90`);

if (leakCount === 0 && passCount === evalData.evaluations.length) {
  console.log('🏆 SONUÇ: TÜM EVAL KRİTERLERİ EKSİKSİZ VE TAM PUANLA GEÇİLDİ! (25/25)');
  console.log('='.repeat(75));
  process.exit(0);
} else {
  console.error('⚠️ UYARI: Bazı tutor cevaplarında sızıntı veya kural ihlali tespit edildi!');
  process.exit(1);
}
