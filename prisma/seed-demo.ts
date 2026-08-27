/**
 * FlexERP Demo — Seed Verisi
 * ALD Plastik verilerinden tamamen bağımsız, genel plastik imalat senaryosu.
 * Çalıştırmak için: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

// Seed için session pooler (DIRECT_URL) kullan — transaction pooler prepared statement desteklemez
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("🌱 FlexERP Demo seed başlatılıyor...");

  // ──────────────────────────────────────────
  // 1. TEMİZLİK
  // ──────────────────────────────────────────
  console.log("🧹 Mevcut veriler temizleniyor...");
  await prisma.pendingEntry.deleteMany();
  await prisma.jobSchedule.deleteMany();
  await prisma.shipmentGroupItem.deleteMany();
  await prisma.shipmentRecord.deleteMany();
  await prisma.shipmentGroup.deleteMany();
  await prisma.productStockMovement.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productionRecord.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.product.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.machine.deleteMany();
  console.log("✅ Temizlik tamamlandı.");

  // ──────────────────────────────────────────
  // 2. HAMMADDELer
  // ──────────────────────────────────────────
  console.log("📦 Hammaddeler ekleniyor...");
  const rawMaterials = await Promise.all([
    prisma.rawMaterial.create({ data: { name: "PP Granül (Polipropilen)", code: "PP-001", unit: "kg", currentStock: 2850, criticalLevel: 500 } }),
    prisma.rawMaterial.create({ data: { name: "PE-HD Granül (Yüksek Yoğunluk)", code: "PE-001", unit: "kg", currentStock: 1420, criticalLevel: 300 } }),
    prisma.rawMaterial.create({ data: { name: "ABS Granül", code: "ABS-001", unit: "kg", currentStock: 380, criticalLevel: 400 } }), // Kritik!
    prisma.rawMaterial.create({ data: { name: "PVC Granül", code: "PVC-001", unit: "kg", currentStock: 960, criticalLevel: 200 } }),
    prisma.rawMaterial.create({ data: { name: "Siyah Masterbatch", code: "MB-SYH", unit: "kg", currentStock: 145, criticalLevel: 50 } }),
    prisma.rawMaterial.create({ data: { name: "Beyaz Masterbatch", code: "MB-BYZ", unit: "kg", currentStock: 88, criticalLevel: 30 } }),
    prisma.rawMaterial.create({ data: { name: "UV Stabilizatör", code: "ADD-UV", unit: "kg", currentStock: 42, criticalLevel: 20 } }),
    prisma.rawMaterial.create({ data: { name: "Cam Elyaf (%30)", code: "GF-30", unit: "kg", currentStock: 620, criticalLevel: 150 } }),
    prisma.rawMaterial.create({ data: { name: "Ambalaj Poşeti (L)", code: "AMB-L", unit: "adet", currentStock: 2400, criticalLevel: 500 } }),
    prisma.rawMaterial.create({ data: { name: "Karton Koli (320x240x150)", code: "KLI-M", unit: "adet", currentStock: 340, criticalLevel: 100 } }),
  ]);

  const [ppGranul, peHD, absGranul, pvcGranul, siyahMB, beyazMB, uvStab, camElyaf, ambPoset, kartonKoli] = rawMaterials;
  console.log(`✅ ${rawMaterials.length} hammadde eklendi.`);

  // ──────────────────────────────────────────
  // 3. ÜRÜNLER
  // ──────────────────────────────────────────
  console.log("🏭 Ürünler ekleniyor...");

  // Alt ürünler (yarı mamuller)
  const kapakyari = await prisma.product.create({
    data: { name: "Kapak Gövdesi (Yarı Mamul)", code: "YM-001", unitWeight: 45, currentStock: 320, criticalLevel: 100 },
  });
  const govdeYari = await prisma.product.create({
    data: { name: "Gövde Alt (Yarı Mamul)", code: "YM-002", unitWeight: 68, currentStock: 180, criticalLevel: 80 },
  });

  // Nihai ürünler
  const urun1 = await prisma.product.create({
    data: { name: "Endüstriyel Konteyner 25L", code: "KNT-025", unitWeight: 650, currentStock: 142, criticalLevel: 50 },
  });
  const urun2 = await prisma.product.create({
    data: { name: "Enjeksiyon Kova 12L", code: "KVA-012", unitWeight: 420, currentStock: 87, criticalLevel: 30 },
  });
  const urun3 = await prisma.product.create({
    data: { name: "Teknik Kapak Seti (3'lü)", code: "KPK-003", unitWeight: 180, currentStock: 35, criticalLevel: 50 }, // Kritik!
  });
  const urun4 = await prisma.product.create({
    data: { name: "PP Palet (120x80)", code: "PLT-001", unitWeight: 8500, currentStock: 24, criticalLevel: 10 },
  });
  const urun5 = await prisma.product.create({
    data: { name: "Boru Bağlantı Elemanı Seti", code: "BRU-SET", unitWeight: 95, currentStock: 560, criticalLevel: 100 },
  });
  const urun6 = await prisma.product.create({
    data: { name: "ABS Muhafaza Kutusu", code: "ABS-KTU", unitWeight: 230, currentStock: 193, criticalLevel: 60 },
  });

  console.log("✅ Ürünler eklendi.");

  // ──────────────────────────────────────────
  // 4. REÇETELER (BOM)
  // ──────────────────────────────────────────
  console.log("📋 Reçeteler oluşturuluyor...");

  // Yarı mamul: Kapak Gövdesi
  await prisma.recipe.createMany({ data: [
    { productId: kapakyari.id, rawMaterialId: ppGranul.id, quantityPerUnit: 42, wastePercentage: 0.03 },
    { productId: kapakyari.id, rawMaterialId: siyahMB.id, quantityPerUnit: 2.5, wastePercentage: 0.02 },
  ]});

  // Nihai: Konteyner 25L (PP + cam elyaf + UV)
  await prisma.recipe.createMany({ data: [
    { productId: urun1.id, rawMaterialId: ppGranul.id, quantityPerUnit: 580, wastePercentage: 0.04 },
    { productId: urun1.id, rawMaterialId: camElyaf.id, quantityPerUnit: 65, wastePercentage: 0.02 },
    { productId: urun1.id, rawMaterialId: uvStab.id, quantityPerUnit: 3, wastePercentage: 0.01 },
    { productId: urun1.id, rawMaterialId: siyahMB.id, quantityPerUnit: 8, wastePercentage: 0.02 },
    { productId: urun1.id, rawMaterialId: ambPoset.id, quantityPerUnit: 1, wastePercentage: 0 },
  ]});

  // Nihai: Kova 12L (PE-HD)
  await prisma.recipe.createMany({ data: [
    { productId: urun2.id, rawMaterialId: peHD.id, quantityPerUnit: 390, wastePercentage: 0.035 },
    { productId: urun2.id, rawMaterialId: beyazMB.id, quantityPerUnit: 12, wastePercentage: 0.02 },
    { productId: urun2.id, rawMaterialId: ambPoset.id, quantityPerUnit: 1, wastePercentage: 0 },
  ]});

  // Nihai: Kapak Seti — yarı mamul + hammadde
  await prisma.recipe.createMany({ data: [
    { productId: urun3.id, componentProductId: kapakyari.id, quantityPerUnit: 3, wastePercentage: 0.01 },
    { productId: urun3.id, rawMaterialId: kartonKoli.id, quantityPerUnit: 1, wastePercentage: 0 },
  ]});

  // Nihai: PP Palet
  await prisma.recipe.createMany({ data: [
    { productId: urun4.id, rawMaterialId: ppGranul.id, quantityPerUnit: 8200, wastePercentage: 0.05 },
    { productId: urun4.id, rawMaterialId: uvStab.id, quantityPerUnit: 15, wastePercentage: 0.01 },
  ]});

  // Nihai: Boru Bağlantı (PVC)
  await prisma.recipe.createMany({ data: [
    { productId: urun5.id, rawMaterialId: pvcGranul.id, quantityPerUnit: 88, wastePercentage: 0.04 },
    { productId: urun5.id, rawMaterialId: ambPoset.id, quantityPerUnit: 1, wastePercentage: 0 },
  ]});

  // Nihai: ABS Kutu
  await prisma.recipe.createMany({ data: [
    { productId: urun6.id, rawMaterialId: absGranul.id, quantityPerUnit: 215, wastePercentage: 0.03 },
    { productId: urun6.id, rawMaterialId: siyahMB.id, quantityPerUnit: 5, wastePercentage: 0.02 },
    { productId: urun6.id, rawMaterialId: kartonKoli.id, quantityPerUnit: 1, wastePercentage: 0 },
  ]});

  console.log("✅ Reçeteler oluşturuldu.");

  // ──────────────────────────────────────────
  // 5. MAKİNELER
  // ──────────────────────────────────────────
  console.log("⚙️ Makineler ekleniyor...");
  const makineler = await Promise.all([
    prisma.machine.create({ data: { name: "Enjeksiyon Makinesi #1 (250T)", description: "250 ton kilit kuvvetli enjeksiyon presi" } }),
    prisma.machine.create({ data: { name: "Enjeksiyon Makinesi #2 (500T)", description: "500 ton büyük parça presi" } }),
    prisma.machine.create({ data: { name: "Ekstrüzyon Hattı #1", description: "Boru ve profil ekstrüzyon" } }),
  ]);
  console.log("✅ Makineler eklendi.");

  // ──────────────────────────────────────────
  // 6. HAMMADDELERİN STOK GİRİŞİ
  // ──────────────────────────────────────────
  console.log("📥 Stok giriş hareketleri oluşturuluyor...");
  const stockEntries = [
    { rawMaterialId: ppGranul.id, amount: 3000, date: daysAgo(25), description: "Tedarikçi: PolyTürk A.Ş. — Sipariş #TRK-2026-041" },
    { rawMaterialId: peHD.id, amount: 1500, date: daysAgo(20), description: "Tedarikçi: EuroPoly — Sipariş #EP-8821" },
    { rawMaterialId: absGranul.id, amount: 500, date: daysAgo(18), description: "Tedarikçi: ChemBase — Sipariş #CB-114" },
    { rawMaterialId: pvcGranul.id, amount: 1000, date: daysAgo(15), description: "Tedarikçi: VinaPlast — Sipariş #VP-2026-07" },
    { rawMaterialId: siyahMB.id, amount: 200, date: daysAgo(12), description: "Masterbatch toplu sipariş" },
    { rawMaterialId: beyazMB.id, amount: 100, date: daysAgo(12), description: "Masterbatch toplu sipariş" },
    { rawMaterialId: uvStab.id, amount: 50, date: daysAgo(10), description: "UV stabilizatör girişi" },
    { rawMaterialId: camElyaf.id, amount: 700, date: daysAgo(8), description: "Cam elyaf — Lot#GF2026-33" },
    { rawMaterialId: ambPoset.id, amount: 3000, date: daysAgo(5), description: "Ambalaj malzemesi girişi" },
    { rawMaterialId: kartonKoli.id, amount: 400, date: daysAgo(5), description: "Koli girişi" },
  ];

  for (const entry of stockEntries) {
    await prisma.stockMovement.create({
      data: { ...entry, type: "GIRIS" },
    });
  }
  console.log("✅ Stok giriş hareketleri tamamlandı.");

  // ──────────────────────────────────────────
  // 7. ÜRETİM KAYITLARI (son 20 gün)
  // ──────────────────────────────────────────
  console.log("🏭 Üretim kayıtları oluşturuluyor...");

  const productions = [
    { productId: urun1.id, quantity: 50, date: daysAgo(22), description: "Parti #1 — Konteyner üretimi" },
    { productId: urun2.id, quantity: 120, date: daysAgo(20), description: "Kova 12L — 2. vardiya" },
    { productId: kapakyari.id, quantity: 200, date: daysAgo(18), description: "Kapak gövdesi yarı mamul" },
    { productId: urun5.id, quantity: 300, date: daysAgo(16), description: "Boru bağlantı seti üretimi" },
    { productId: urun6.id, quantity: 80, date: daysAgo(14), description: "ABS kutu üretim turu" },
    { productId: urun1.id, quantity: 60, date: daysAgo(12), description: "Konteyner — müşteri siparişi #MUS-042" },
    { productId: urun2.id, quantity: 150, date: daysAgo(10), description: "Kova stok tamamlama" },
    { productId: kapakyari.id, quantity: 250, date: daysAgo(8), description: "Kapak gövdesi — stok artırımı" },
    { productId: urun3.id, quantity: 100, date: daysAgo(6), description: "Kapak seti montaj" },
    { productId: urun4.id, quantity: 20, date: daysAgo(4), description: "PP Palet — sipariş #PLT-2026-08" },
    { productId: urun5.id, quantity: 200, date: daysAgo(3), description: "Boru seti — stok" },
    { productId: urun6.id, quantity: 100, date: daysAgo(2), description: "ABS kutu — ihracat siparişi" },
    { productId: urun2.id, quantity: 80, date: daysAgo(1), description: "Kova — acil sipariş" },
  ];

  for (const prod of productions) {
    const record = await prisma.productionRecord.create({ data: prod });

    // Ürün stok hareketi
    await prisma.productStockMovement.create({
      data: {
        productId: prod.productId,
        type: "URETIM_GIRISI",
        quantity: prod.quantity,
        date: prod.date,
        description: `Üretim: ${prod.description}`,
        productionRecordId: record.id,
      },
    });

    // Hammadde çıkış hareketi (basit simülasyon)
    const recipes = await prisma.recipe.findMany({ where: { productId: prod.productId, rawMaterialId: { not: null } } });
    for (const recipe of recipes) {
      if (!recipe.rawMaterialId) continue;
      const usedQty = Number(recipe.quantityPerUnit) * prod.quantity * (1 + Number(recipe.wastePercentage));
      await prisma.stockMovement.create({
        data: {
          rawMaterialId: recipe.rawMaterialId,
          type: "URETIM_CIKISI",
          amount: usedQty,
          date: prod.date,
          description: `Üretim çıkışı: ${prod.description}`,
          productionRecordId: record.id,
        },
      });
    }
  }
  console.log("✅ Üretim kayıtları tamamlandı.");

  // ──────────────────────────────────────────
  // 8. SEVKİYAT GRUPLARI
  // ──────────────────────────────────────────
  console.log("🚚 Sevkiyat grupları oluşturuluyor...");
  const sg1 = await prisma.shipmentGroup.create({
    data: {
      code: "SG-STD-A",
      name: "Standart Müşteri Paketi A",
      items: {
        create: [
          { productId: urun1.id, quantityPerUnit: 10 },
          { productId: urun2.id, quantityPerUnit: 20 },
        ],
      },
    },
  });

  const sg2 = await prisma.shipmentGroup.create({
    data: {
      code: "SG-EXP-01",
      name: "İhracat Seti #01",
      items: {
        create: [
          { productId: urun5.id, quantityPerUnit: 50 },
          { productId: urun6.id, quantityPerUnit: 30 },
        ],
      },
    },
  });
  console.log("✅ Sevkiyat grupları oluşturuldu.");

  // ──────────────────────────────────────────
  // 9. SEVKİYAT KAYITLARI
  // ──────────────────────────────────────────
  console.log("📤 Sevkiyat kayıtları oluşturuluyor...");

  const sevkiyatlar = [
    { type: "TEKIL_URUN", productId: urun1.id, quantity: 30, date: daysAgo(19), description: "Müşteri: Yıldız Plastik A.Ş." },
    { type: "GRUP", shipmentGroupId: sg1.id, quantity: 2, date: daysAgo(14), description: "Müşteri: EuroBuild GmbH" },
    { type: "TEKIL_URUN", productId: urun2.id, quantity: 50, date: daysAgo(9), description: "Müşteri: Mega Market Zinciri" },
    { type: "GRUP", shipmentGroupId: sg2.id, quantity: 1, date: daysAgo(5), description: "İhracat: Almanya — Hamburg Limanı" },
    { type: "TEKIL_URUN", productId: urun4.id, quantity: 8, date: daysAgo(3), description: "Müşteri: Depo Lojistik A.Ş." },
  ];

  for (const sev of sevkiyatlar) {
    const shipRecord = await prisma.shipmentRecord.create({ data: sev });

    // Ürün stok düşümü
    const targetProductId = sev.productId || null;
    if (targetProductId) {
      const totalQty = Number(sev.quantity);
      await prisma.productStockMovement.create({
        data: {
          productId: targetProductId,
          type: "SEVKIYAT_CIKISI",
          quantity: -totalQty,
          date: sev.date,
          description: `Sevkiyat: ${sev.description}`,
          shipmentRecordId: shipRecord.id,
        },
      });
    }

    if (sev.shipmentGroupId) {
      const groupItems = await prisma.shipmentGroupItem.findMany({ where: { shipmentGroupId: sev.shipmentGroupId } });
      for (const item of groupItems) {
        const totalQty = Number(item.quantityPerUnit) * Number(sev.quantity);
        await prisma.productStockMovement.create({
          data: {
            productId: item.productId,
            type: "SEVKIYAT_CIKISI",
            quantity: -totalQty,
            date: sev.date,
            description: `Grup sevkiyat: ${sev.description}`,
            shipmentRecordId: shipRecord.id,
          },
        });
      }
    }
  }
  console.log("✅ Sevkiyat kayıtları tamamlandı.");

  // ──────────────────────────────────────────
  // 10. ONAY BEKLEYENLer (demo için 2 tane)
  // ──────────────────────────────────────────
  console.log("📝 Onay bekleyen kayıtlar oluşturuluyor...");
  await prisma.pendingEntry.createMany({
    data: [
      {
        type: "URETIM",
        productId: urun3.id,
        quantity: 50,
        submittedByName: "Ahmet Usta",
        notes: "Acil sipariş için ek üretim talebi",
        status: "BEKLIYOR",
      },
      {
        type: "SEVKIYAT",
        productId: urun1.id,
        quantity: 25,
        submittedByName: "Mehmet Usta",
        notes: "Müşteri: AlpTech — fatura hazır",
        status: "BEKLIYOR",
      },
    ],
  });
  console.log("✅ Onay bekleyen kayıtlar oluşturuldu.");

  // ──────────────────────────────────────────
  // 11. İŞ TAKİBİ (Planlanan işler)
  // ──────────────────────────────────────────
  console.log("📅 İş takibi planları oluşturuluyor...");
  const makine1 = makineler[0];
  const makine2 = makineler[1];

  const now = new Date();
  await prisma.jobSchedule.createMany({
    data: [
      {
        machineId: makine1.id,
        productId: urun2.id,
        rawMaterialId: peHD.id,
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        expectedQty: 200,
        status: "PLANLANDI",
        notes: "3. vardiya — Kova 12L üretimi",
      },
      {
        machineId: makine2.id,
        productId: urun1.id,
        rawMaterialId: ppGranul.id,
        startTime: new Date(now.getTime() + 1 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 10 * 60 * 60 * 1000),
        expectedQty: 80,
        status: "DEVAM_EDIYOR",
        notes: "Konteyner 25L — müşteri siparişi MUS-048",
      },
      {
        machineId: makine1.id,
        productId: urun5.id,
        rawMaterialId: pvcGranul.id,
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 32 * 60 * 60 * 1000),
        expectedQty: 400,
        status: "PLANLANDI",
        notes: "Boru bağlantı seti — yarın sabah",
      },
    ],
  });
  console.log("✅ İş takibi planları oluşturuldu.");

  console.log("\n🎉 FlexERP Demo seed tamamlandı!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ ${rawMaterials.length} hammadde`);
  console.log(`✅ 8 ürün (2 yarı mamul + 6 nihai)`);
  console.log(`✅ ${productions.length} üretim kaydı`);
  console.log(`✅ ${sevkiyatlar.length} sevkiyat kaydı`);
  console.log(`✅ 2 sevkiyat grubu`);
  console.log(`✅ 3 makine`);
  console.log(`✅ 3 iş planı`);
  console.log(`✅ 2 onay bekleyen kayıt`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
