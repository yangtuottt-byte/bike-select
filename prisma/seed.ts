import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { join } from "path";

const dbPath = join(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

const prisma = new PrismaClient({ adapter });

// ─── 高分辨率真实自行车摄影图片 ──────────────────────────────────
// 图源: Unsplash 专业运动摄影 — 均为真实自行车/骑行场景高清照片
// 分辨率 1200px / 质量 85% / 自动格式优化
const IMG = {
  // — 公路竞速 / 大组冲刺 (Tarmac, TCR, Madone SLR) —
  race_peloton:
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200",
  race_solo:
    "https://images.unsplash.com/photo-1507035894369-40a59592f0ff?w=1200",
  race_sprint:
    "https://images.unsplash.com/photo-1519682337058-aecd6b8d7e09?w=1200",
  race_descent:
    "https://images.unsplash.com/photo-1486723311953-58e02b6c0e7e?w=1200",

  // — 空气动力学 / 平路破风 (Propel, Madone) —
  aero_profile:
    "https://images.unsplash.com/photo-1481250873790-2d5b0ee4f309?w=1200",

  // — 超轻爬坡 / 碳纤维细节 (Aethos, TCR SL) —
  climb_carbon:
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1200",
  climb_wheel:
    "https://images.unsplash.com/photo-1559715541-5baa2d19f6e3?w=1200",

  // — 长途耐力 / 古典赛 (Roubaix, Domane, Defy) —
  endure_open:
    "https://images.unsplash.com/photo-1471506480004-8f7e3e3b1b1a?w=1200",
  endure_city:
    "https://images.unsplash.com/photo-1485965125584-6b7c244b0e1d?w=1200",

  // — 砾石 / 全地形探险 (Diverge, Revolt, Checkpoint) —
  gravel_dirt:
    "https://images.unsplash.com/photo-1571068316941-1e8a477d1e3c?w=1200",
  gravel_trail:
    "https://images.unsplash.com/photo-1559344849-2c2f3c5f29b5?w=1200",
  gravel_mtb:
    "https://images.unsplash.com/photo-1576435728678-6a0f9d3f2e2d?w=1200",
};

// ─── 辅助函数 ──────────────────────────────────────────────────
const geo = (sizes: [string, number, number][]) =>
  JSON.stringify({ sizes: sizes.map(([size, reach, stack]) => ({ size, reach, stack })) });

const tags = (t: string[]) => JSON.stringify(t);

// ─── Specs 生成工厂 ────────────────────────────────────────────
interface SpecSet {
  frame: string;
  wheelset: string;
  shifters: string;
  derailleurFront: string;
  derailleurRear: string;
  crankset: string;
  cassette: string;
  tires: string;
}

const sWrap = (s: SpecSet) => JSON.stringify(s);

/* ──────── Specialized 配置 ──────── */

const SW_DURA_ACE: SpecSet = {
  frame: "S-Works FACT 12r 碳纤维，全内走线",
  wheelset: "Roval Rapide CLX II (前51mm / 后60mm 框高)",
  shifters: "Shimano Dura-Ace ST-R9270 Di2 电子变速",
  derailleurFront: "Shimano Dura-Ace FD-R9250 Di2",
  derailleurRear: "Shimano Dura-Ace RD-R9250 Di2",
  crankset: "Shimano Dura-Ace FC-R9200 52/36T，双边功率计",
  cassette: "Shimano Dura-Ace CS-R9200 11-30T 12速",
  tires: "S-Works Turbo Cotton 700×26c",
};

const SW_RED: SpecSet = {
  frame: "S-Works FACT 12r 碳纤维，全内走线",
  wheelset: "Roval Rapide CLX II (前51mm / 后60mm 框高)",
  shifters: "SRAM Red eTap AXS 无线电子变速",
  derailleurFront: "SRAM Red AXS",
  derailleurRear: "SRAM Red AXS",
  crankset: "SRAM Red AXS 48/35T，Quarq 功率计",
  cassette: "SRAM Red XG-1290 10-33T 12速",
  tires: "S-Works Turbo Cotton 700×26c",
};

const PRO_ULTE: SpecSet = {
  frame: "FACT 10r 碳纤维，全内走线",
  wheelset: "Roval Rapide CL II (前51mm / 后60mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 52/36T，单边功率计",
  cassette: "Shimano Ultegra CS-R8100 11-30T 12速",
  tires: "S-Works Turbo 700×26c",
};

const EXPERT_105DI2: SpecSet = {
  frame: "FACT 10r 碳纤维，全内走线",
  wheelset: "Roval C38 碳纤维 (38mm 框高)",
  shifters: "Shimano 105 ST-R7170 Di2 电子变速",
  derailleurFront: "Shimano 105 FD-R7150 Di2",
  derailleurRear: "Shimano 105 RD-R7150 Di2",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-R7100 11-34T 12速",
  tires: "Specialized Turbo Pro 700×26c",
};

const COMP_105: SpecSet = {
  frame: "FACT 9r 碳纤维，全内走线",
  wheelset: "DT Swiss R470 铝合金 (23mm 内宽)",
  shifters: "Shimano 105 ST-R7120 机械变速",
  derailleurFront: "Shimano 105 FD-R7100",
  derailleurRear: "Shimano 105 RD-R7100",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-HG710 11-34T 12速",
  tires: "Specialized Roadsport 700×26c",
};

const AETHOS_SW: SpecSet = {
  frame: "S-Works Aethos FACT 12r 碳纤维 (585g 车架)",
  wheelset: "Roval Alpinist CLX II (33mm 框高 超轻爬坡轮)",
  shifters: "SRAM Red eTap AXS 无线电子变速",
  derailleurFront: "SRAM Red AXS",
  derailleurRear: "SRAM Red AXS",
  crankset: "SRAM Red AXS 48/35T，Quarq 功率计",
  cassette: "SRAM Red XG-1290 10-33T 12速",
  tires: "S-Works Turbo Cotton 700×28c",
};

const AETHOS_PRO: SpecSet = {
  frame: "Aethos FACT 10r 碳纤维",
  wheelset: "Roval Alpinist CL (33mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 50/34T",
  cassette: "Shimano Ultegra CS-R8100 11-30T 12速",
  tires: "S-Works Turbo 700×28c",
};

const ROUBAIX_SW: SpecSet = {
  frame: "S-Works Roubaix SL8 FACT 12r 碳纤维，Future Shock 3.0",
  wheelset: "Roval Terra CLX II (32mm 框高 耐力/全地形)",
  shifters: "SRAM Red eTap AXS 无线电子变速",
  derailleurFront: "SRAM Red AXS",
  derailleurRear: "SRAM Red AXS",
  crankset: "SRAM Red AXS 46/33T，Quarq 功率计",
  cassette: "SRAM Red XG-1290 10-36T 12速",
  tires: "Specialized S-Works Mondo 700×32c",
};

const ROUBAIX_PRO: SpecSet = {
  frame: "Roubaix SL8 FACT 10r 碳纤维，Future Shock 3.0",
  wheelset: "Roval Terra CL (32mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 50/34T",
  cassette: "Shimano Ultegra CS-R8100 11-34T 12速",
  tires: "Specialized Turbo Pro 700×30c",
};

const DIVERGE_STR: SpecSet = {
  frame: "Diverge STR FACT 11r 碳纤维，Future Shock 后避震",
  wheelset: "Roval Terra CLX EVO (25mm 内宽 全地形)",
  shifters: "SRAM Force eTap AXS 无线电子变速",
  derailleurFront: "SRAM Force AXS",
  derailleurRear: "SRAM Force AXS XPLR",
  crankset: "SRAM Force AXS 42T，Quarq 功率计",
  cassette: "SRAM Force XPLR XG-1271 10-44T 12速",
  tires: "Specialized Pathfinder Pro 700×42c",
};

const DIVERGE_COMP: SpecSet = {
  frame: "Diverge Comp E5 铝合金，Future Shock 1.5",
  wheelset: "DT Swiss G540 铝合金 (24mm 内宽)",
  shifters: "SRAM Rival eTap AXS 无线电子变速",
  derailleurFront: "SRAM Rival AXS",
  derailleurRear: "SRAM Rival AXS XPLR",
  crankset: "SRAM Rival AXS 40T",
  cassette: "SRAM Rival XPLR XG-1251 10-44T 12速",
  tires: "Specialized Pathfinder Sport 700×38c",
};

/* ──────── Giant 配置 ──────── */

const TCR_SL0: SpecSet = {
  frame: "TCR Advanced SL-Grade 碳纤维 (第十代)，全内走线",
  wheelset: "Cadex 42 Ultra Disc 碳纤维 (42mm 框高)",
  shifters: "Shimano Dura-Ace ST-R9270 Di2 电子变速",
  derailleurFront: "Shimano Dura-Ace FD-R9250 Di2",
  derailleurRear: "Shimano Dura-Ace RD-R9250 Di2",
  crankset: "Shimano Dura-Ace FC-R9200 52/36T，双边功率计",
  cassette: "Shimano Dura-Ace CS-R9200 11-30T 12速",
  tires: "Cadex Race GC 700×25c",
};

const TCR_PRO0: SpecSet = {
  frame: "TCR Advanced Pro-Grade 碳纤维，全内走线",
  wheelset: "Giant SLR 1 36 Disc 碳纤维 (36mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 52/36T，单边功率计",
  cassette: "Shimano Ultegra CS-R8100 11-30T 12速",
  tires: "Giant Gavia Course 1 700×25c",
};

const TCR_PRO1: SpecSet = {
  frame: "TCR Advanced Pro-Grade 碳纤维，全内走线",
  wheelset: "Giant SLR 1 36 Disc 碳纤维 (36mm 框高)",
  shifters: "Shimano 105 ST-R7170 Di2 电子变速",
  derailleurFront: "Shimano 105 FD-R7150 Di2",
  derailleurRear: "Shimano 105 RD-R7150 Di2",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-R7100 11-34T 12速",
  tires: "Giant Gavia Course 1 700×25c",
};

const TCR_ADV2: SpecSet = {
  frame: "TCR Advanced-Grade 碳纤维，全内走线",
  wheelset: "Giant P-R2 铝合金 (19mm 内宽)",
  shifters: "Shimano 105 ST-R7120 机械变速",
  derailleurFront: "Shimano 105 FD-R7100",
  derailleurRear: "Shimano 105 RD-R7100",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-HG710 11-34T 12速",
  tires: "Giant Gavia Course 2 700×25c",
};

const PROPEL_SL0: SpecSet = {
  frame: "Propel Advanced SL-Grade 碳纤维，AeroSystem 气动管型",
  wheelset: "Cadex 65 Aero Disc 碳纤维 (前65mm / 后65mm 框高)",
  shifters: "Shimano Dura-Ace ST-R9270 Di2 电子变速",
  derailleurFront: "Shimano Dura-Ace FD-R9250 Di2",
  derailleurRear: "Shimano Dura-Ace RD-R9250 Di2",
  crankset: "Shimano Dura-Ace FC-R9200 54/40T，双边功率计",
  cassette: "Shimano Dura-Ace CS-R9200 11-30T 12速",
  tires: "Cadex Aero Race 700×25c",
};

const PROPEL_PRO1: SpecSet = {
  frame: "Propel Advanced Pro-Grade 碳纤维，AeroSystem 气动管型",
  wheelset: "Giant SLR 1 50 Disc 碳纤维 (前50mm / 后50mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 52/36T，单边功率计",
  cassette: "Shimano Ultegra CS-R8100 11-30T 12速",
  tires: "Giant Gavia Course 1 700×25c",
};

const PROPEL_ADV1: SpecSet = {
  frame: "Propel Advanced-Grade 碳纤维，AeroSystem 气动管型",
  wheelset: "Giant SLR 2 50 Disc 碳纤维 (50mm 框高)",
  shifters: "Shimano 105 ST-R7170 Di2 电子变速",
  derailleurFront: "Shimano 105 FD-R7150 Di2",
  derailleurRear: "Shimano 105 RD-R7150 Di2",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-R7100 11-34T 12速",
  tires: "Giant Gavia Course 2 700×25c",
};

const DEFY_PRO0: SpecSet = {
  frame: "Defy Advanced Pro-Grade 碳纤维，D-Fuse 座管吸震",
  wheelset: "Giant SLR 1 36 Disc 碳纤维 (36mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 50/34T",
  cassette: "Shimano Ultegra CS-R8100 11-34T 12速",
  tires: "Giant Gavia Fondo 1 700×32c",
};

const DEFY_ADV1: SpecSet = {
  frame: "Defy Advanced-Grade 碳纤维，D-Fuse 座管吸震",
  wheelset: "Giant P-R2 铝合金 (19mm 内宽)",
  shifters: "Shimano 105 ST-R7170 Di2 电子变速",
  derailleurFront: "Shimano 105 FD-R7150 Di2",
  derailleurRear: "Shimano 105 RD-R7150 Di2",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-R7100 11-34T 12速",
  tires: "Giant Gavia Fondo 2 700×32c",
};

const REVOLT_PRO0: SpecSet = {
  frame: "Revolt Advanced Pro-Grade 碳纤维，全地形几何",
  wheelset: "Giant CXR 2 碳纤维 (35mm 框高，25mm 内宽)",
  shifters: "Shimano GRX ST-RX825 Di2 电子变速",
  derailleurFront: "Shimano GRX FD-RX825 Di2",
  derailleurRear: "Shimano GRX RD-RX825 Di2",
  crankset: "Shimano GRX FC-RX820 48/31T",
  cassette: "Shimano Ultegra CS-R8100 11-36T 12速",
  tires: "Maxxis Receptor 700×40c",
};

const REVOLT_ADV1: SpecSet = {
  frame: "Revolt Advanced-Grade 碳纤维，全地形几何",
  wheelset: "Giant P-X2 铝合金 (25mm 内宽)",
  shifters: "Shimano GRX ST-RX610 机械变速",
  derailleurFront: "Shimano GRX FD-RX820",
  derailleurRear: "Shimano GRX RD-RX820",
  crankset: "Shimano GRX FC-RX610 46/30T",
  cassette: "Shimano 105 CS-HG710 11-36T 12速",
  tires: "Maxxis Receptor 700×40c",
};

/* ──────── Trek 配置 ──────── */

const MADONE_SLR9: SpecSet = {
  frame: "800 Series OCLV Carbon，IsoFlow 气动破风，全内走线",
  wheelset: "Bontrager Aeolus RSL 51 (前51mm / 后51mm 框高)",
  shifters: "Shimano Dura-Ace ST-R9270 Di2 电子变速",
  derailleurFront: "Shimano Dura-Ace FD-R9250 Di2",
  derailleurRear: "Shimano Dura-Ace RD-R9250 Di2",
  crankset: "Shimano Dura-Ace FC-R9200 52/36T，双边功率计",
  cassette: "Shimano Dura-Ace CS-R9200 11-30T 12速",
  tires: "Bontrager R4 320 700×26c",
};

const MADONE_SLR7: SpecSet = {
  frame: "800 Series OCLV Carbon，IsoFlow 气动破风，全内走线",
  wheelset: "Bontrager Aeolus Pro 51 (前51mm / 后51mm 框高)",
  shifters: "Shimano Ultegra ST-R8170 Di2 电子变速",
  derailleurFront: "Shimano Ultegra FD-R8150 Di2",
  derailleurRear: "Shimano Ultegra RD-R8150 Di2",
  crankset: "Shimano Ultegra FC-R8100 52/36T",
  cassette: "Shimano Ultegra CS-R8100 11-30T 12速",
  tires: "Bontrager R3 320 700×26c",
};

const MADONE_SL6: SpecSet = {
  frame: "500 Series OCLV Carbon，IsoFlow 气动破风，全内走线",
  wheelset: "Bontrager Aeolus Elite 50 (50mm 框高)",
  shifters: "Shimano 105 ST-R7170 Di2 电子变速",
  derailleurFront: "Shimano 105 FD-R7150 Di2",
  derailleurRear: "Shimano 105 RD-R7150 Di2",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-R7100 11-34T 12速",
  tires: "Bontrager R2 700×26c",
};

const MADONE_SL5: SpecSet = {
  frame: "500 Series OCLV Carbon，IsoFlow 气动破风，全内走线",
  wheelset: "Bontrager Paradigm SL 铝合金 (23mm 内宽)",
  shifters: "Shimano 105 ST-R7120 机械变速",
  derailleurFront: "Shimano 105 FD-R7100",
  derailleurRear: "Shimano 105 RD-R7100",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-HG710 11-34T 12速",
  tires: "Bontrager R1 700×26c",
};

const DOMANE_SLR9: SpecSet = {
  frame: "800 Series OCLV Carbon，IsoSpeed 后避震，全内走线",
  wheelset: "Bontrager Aeolus RSL 37 (37mm 框高 耐力优化)",
  shifters: "Shimano Dura-Ace ST-R9270 Di2 电子变速",
  derailleurFront: "Shimano Dura-Ace FD-R9250 Di2",
  derailleurRear: "Shimano Dura-Ace RD-R9250 Di2",
  crankset: "Shimano Dura-Ace FC-R9200 50/34T，双边功率计",
  cassette: "Shimano Dura-Ace CS-R9200 11-34T 12速",
  tires: "Bontrager R4 320 700×32c",
};

const DOMANE_SL6: SpecSet = {
  frame: "500 Series OCLV Carbon，IsoSpeed 后避震，全内走线",
  wheelset: "Bontrager Aeolus Elite 35 (35mm 框高)",
  shifters: "Shimano 105 ST-R7170 Di2 电子变速",
  derailleurFront: "Shimano 105 FD-R7150 Di2",
  derailleurRear: "Shimano 105 RD-R7150 Di2",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-R7100 11-34T 12速",
  tires: "Bontrager R2 700×32c",
};

const DOMANE_AL5: SpecSet = {
  frame: "300 Series Alpha Aluminum 铝合金，IsoSpeed 后避震",
  wheelset: "Bontrager Paradigm SL 铝合金 (23mm 内宽)",
  shifters: "Shimano 105 ST-R7120 机械变速",
  derailleurFront: "Shimano 105 FD-R7100",
  derailleurRear: "Shimano 105 RD-R7100",
  crankset: "Shimano 105 FC-R7100 50/34T",
  cassette: "Shimano 105 CS-HG710 11-34T 12速",
  tires: "Bontrager R1 700×32c",
};

const CHECKPOINT_SLR9: SpecSet = {
  frame: "800 Series OCLV Carbon，IsoSpeed 后避震，全地形几何",
  wheelset: "Bontrager Aeolus RSL 37V (37mm 框高 25mm 内宽)",
  shifters: "SRAM Red eTap AXS 无线电子变速",
  derailleurFront: "SRAM Red AXS",
  derailleurRear: "SRAM Red AXS XPLR",
  crankset: "SRAM Red AXS 42T，Quarq 功率计",
  cassette: "SRAM Red XPLR XG-1291 10-44T 12速",
  tires: "Bontrager GR1 Team Issue 700×42c",
};

const CHECKPOINT_SL5: SpecSet = {
  frame: "500 Series OCLV Carbon，IsoSpeed 后避震，全地形几何",
  wheelset: "Bontrager Paradigm Comp 25 (25mm 内宽 铝合金)",
  shifters: "Shimano GRX ST-RX820 机械变速",
  derailleurFront: "Shimano GRX FD-RX820",
  derailleurRear: "Shimano GRX RD-RX820",
  crankset: "Shimano GRX FC-RX820 48/31T",
  cassette: "Shimano SLX CS-M7100 11-42T 12速",
  tires: "Bontrager GR1 Team Issue 700×40c",
};

const CHECKPOINT_ALR5: SpecSet = {
  frame: "300 Series Alpha Aluminum 铝合金，全地形几何",
  wheelset: "Bontrager Paradigm SL 铝合金 (23mm 内宽)",
  shifters: "Shimano GRX ST-RX610 机械变速",
  derailleurFront: "Shimano GRX FD-RX820",
  derailleurRear: "Shimano GRX RD-RX820",
  crankset: "Shimano GRX FC-RX610 46/30T",
  cassette: "Shimano 105 CS-HG710 11-36T 12速",
  tires: "Bontrager GR1 Comp 700×40c",
};

// ─── 几何数据 ──────────────────────────────────────────────────
// 格式: [size, reach, stack][]

const TARMAC_GEO: [string, number, number][] = [
  ["49", 375, 504], ["52", 380, 517], ["54", 384, 534],
  ["56", 392, 555], ["58", 402, 578],
];
const AETHOS_GEO: [string, number, number][] = [
  ["49", 373, 515], ["52", 378, 531], ["54", 383, 550],
  ["56", 391, 572], ["58", 400, 596],
];
const ROUBAIX_GEO: [string, number, number][] = [
  ["49", 371, 538], ["52", 376, 558], ["54", 382, 580],
  ["56", 389, 605], ["58", 397, 630],
];
const DIVERGE_GEO: [string, number, number][] = [
  ["49", 375, 544], ["52", 380, 562], ["54", 385, 584],
  ["56", 392, 606], ["58", 400, 630],
];
const TCR_GEO: [string, number, number][] = [
  ["S", 378, 517], ["M", 383, 535], ["ML", 393, 558], ["L", 402, 582],
];
const PROPEL_GEO: [string, number, number][] = [
  ["S", 382, 515], ["M", 388, 533], ["ML", 397, 556], ["L", 406, 580],
];
const DEFY_GEO: [string, number, number][] = [
  ["S", 375, 525], ["M", 381, 545], ["ML", 388, 568], ["L", 396, 593],
];
const REVOLT_GEO: [string, number, number][] = [
  ["S", 385, 535], ["M", 393, 556], ["ML", 401, 579], ["L", 410, 604],
];
const MADONE_GEO: [string, number, number][] = [
  ["50", 374, 515], ["52", 379, 528], ["54", 382, 542],
  ["56", 387, 561], ["58", 395, 582],
];
const DOMANE_GEO: [string, number, number][] = [
  ["50", 371, 546], ["52", 374, 561], ["54", 378, 575],
  ["56", 382, 591], ["58", 387, 609],
];
const CHECKPOINT_GEO: [string, number, number][] = [
  ["49", 384, 536], ["52", 389, 552], ["54", 393, 571],
  ["56", 398, 592], ["58", 404, 614],
];

// ─── 场景标签 ──────────────────────────────────────────────────
const TAG_RACE = tags(["比赛竞速", "竞速训练", "爬坡"]);
const TAG_CLIMB = tags(["爬坡", "比赛竞速", "放坡"]);
const TAG_AERO = tags(["平路巡航", "比赛竞速", "竞速训练"]);
const TAG_ENDURANCE = tags(["长途耐力", "休闲骑行", "通勤"]);
const TAG_GRAVEL = tags(["碎石路", "长途重装", "冒险骑行"]);
const TAG_GRAVEL_SPORT = tags(["碎石路", "冒险骑行", "竞速训练"]);

// ────────────────────────────────────────────────────────────────
//  主流程
// ────────────────────────────────────────────────────────────────

async function main() {
  console.log("清空已有数据……");
  await prisma.bike.deleteMany();
  await prisma.brand.deleteMany();

  // ── 品牌 ─────────────────────────────────────────────────────

  const specialized = await prisma.brand.create({
    data: {
      name: "Specialized",
      country: "USA",
      website: "https://www.specialized.com",
      foundedYear: 1974,
      description: "美国顶级自行车品牌，以「Innovate or Die」为信条。Tarmac、Aethos、Roubaix、Diverge 四大车系横扫公路竞速、超轻爬坡、古典赛耐力与砾石全地形四大场景。",
    },
  });

  const giant = await prisma.brand.create({
    data: {
      name: "Giant",
      country: "Taiwan",
      website: "https://www.giant-bicycles.com",
      foundedYear: 1972,
      description: "全球最大自行车制造商，自主碳纤维编织与一体成型工艺。TCR（全能爬坡）、Propel（空气动力学）、Defy（长途耐力）、Revolt（砾石探险）四大车系覆盖全场景。",
    },
  });

  const trek = await prisma.brand.create({
    data: {
      name: "Trek",
      country: "USA",
      website: "https://www.trekbikes.com",
      foundedYear: 1976,
      description: "美国老牌自行车巨头，以 OCLV 碳纤维工艺和 IsoSpeed 吸震技术闻名。Madone（气动破风）、Domane（古典赛耐力）、Checkpoint（砾石探险）三大车系屡获世界大赛桂冠。",
    },
  });

  console.log("品牌已注入: Specialized, Giant, Trek");

  // ── 车型数据 ─────────────────────────────────────────────────

  const bikes = [
    // ═══════════ SPECIALIZED (11 款) ═══════════
    {
      model: "S-Works Tarmac SL8",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 99990, weight: 6.6,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: geo(TARMAC_GEO), scenarioTags: TAG_RACE,
      specs: sWrap(SW_DURA_ACE),
      image: IMG.race_peloton,
      description: "世巡赛全能王，S-Works FACT 12r 碳纤维 + 空气动力学优化前叉与后上叉，刚性重量比业界标杆。Dura-Ace 电子变速，Roval Rapide CLX II 高低框差速轮组。",
    },
    {
      model: "Tarmac SL8 Pro",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 59990, weight: 7.1,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(TARMAC_GEO), scenarioTags: TAG_RACE,
      specs: sWrap(PRO_ULTE),
      image: IMG.race_solo,
      description: "次旗舰 Tarmac，继承 S-Works 几何基因。FACT 10r 碳纤维 + Ultegra Di2 电子变速，最平衡的性能与价格选择。",
    },
    {
      model: "Tarmac SL8 Expert",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 39990, weight: 7.5,
      groupset: "Shimano 105 Di2 R7170",
      reachStack: geo(TARMAC_GEO), scenarioTags: tags(["竞速训练", "爬坡", "通勤"]),
      specs: sWrap(EXPERT_105DI2),
      image: IMG.race_sprint,
      description: "Tarmac 进阶之选，FACT 10r 碳纤维车架与 105 Di2 电子变速的组合，亲民价格享受竞赛几何。",
    },
    {
      model: "Tarmac SL8 Comp",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 24990, weight: 8.0,
      groupset: "Shimano 105 R7100",
      reachStack: geo(TARMAC_GEO), scenarioTags: tags(["竞速训练", "通勤"]),
      specs: sWrap(COMP_105),
      image: IMG.race_descent,
      description: "Tarmac 入门碳纤维版本，FACT 9r 碳纤维 + 105 机械变速，开启竞赛之路的第一台战车。",
    },
    // Aethos
    {
      model: "S-Works Aethos",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 96800, weight: 5.9,
      groupset: "SRAM Red eTap AXS",
      reachStack: geo(AETHOS_GEO), scenarioTags: TAG_CLIMB,
      specs: sWrap(AETHOS_SW),
      image: IMG.climb_carbon,
      description: "史上最轻量产公路车架 (585g)，回归纯粹骑行质感。S-Works FACT 12r 碳纤维 + SRAM Red AXS，山路王者。",
    },
    {
      model: "Aethos Pro",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 58800, weight: 6.6,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(AETHOS_GEO), scenarioTags: TAG_CLIMB,
      specs: sWrap(AETHOS_PRO),
      image: IMG.climb_wheel,
      description: "超轻爬坡利器 Pro 级别，圆管碳纤维美学 + Ultegra Di2，享受山道爬升的纯粹乐趣。",
    },
    // Roubaix
    {
      model: "S-Works Roubaix SL8",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 92800, weight: 7.2,
      groupset: "SRAM Red eTap AXS",
      reachStack: geo(ROUBAIX_GEO), scenarioTags: TAG_ENDURANCE,
      specs: sWrap(ROUBAIX_SW),
      image: IMG.endure_open,
      description: "巴黎-鲁贝冠军血脉，Future Shock 3.0 头管液压避震 + 后上叉弹性形变。32mm 宽胎兼容，石板路如履平地。",
    },
    {
      model: "Roubaix SL8 Pro",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 52800, weight: 7.8,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(ROUBAIX_GEO), scenarioTags: tags(["长途耐力", "通勤", "休闲骑行"]),
      specs: sWrap(ROUBAIX_PRO),
      image: IMG.endure_city,
      description: "Roubaix Pro 级，Future Shock 3.0 + Ultegra Di2，以合理价格获得古典赛冠军基因的舒适战车。",
    },
    // Diverge
    {
      model: "Diverge STR Pro",
      brandId: specialized.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 56800, weight: 8.5,
      groupset: "SRAM Force eTap AXS",
      reachStack: geo(DIVERGE_GEO), scenarioTags: TAG_GRAVEL,
      specs: sWrap(DIVERGE_STR),
      image: IMG.gravel_dirt,
      description: "Gravel 舒适性制高点：Future Shock 头管 + 后部弹性形变双避震。47mm 胎宽 + 多处挂载孔，长途无惧。",
    },
    {
      model: "Diverge Comp E5",
      brandId: specialized.id,
      frameMaterial: "aluminum", brakeSystem: "disc",
      price: 28800, weight: 9.6,
      groupset: "SRAM Rival eTap AXS",
      reachStack: geo(DIVERGE_GEO), scenarioTags: tags(["碎石路", "冒险骑行", "通勤"]),
      specs: sWrap(DIVERGE_COMP),
      image: IMG.gravel_trail,
      description: "铝合金砾石战车，Future Shock 1.5 + Rival AXS 无线电子变速，入门 Gravel 的超高性价比选择。",
    },

    // ═══════════ GIANT (11 款) ═══════════
    {
      model: "TCR Advanced SL 0",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 72800, weight: 6.5,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: geo(TCR_GEO), scenarioTags: TAG_CLIMB,
      specs: sWrap(TCR_SL0),
      image: IMG.climb_carbon,
      description: "第十代 TCR 旗舰，SL-Grade 碳纤维 + Dura-Ace Di2 + Cadex 42 Ultra 碳轮，爬坡竞赛的终极武器。",
    },
    {
      model: "TCR Advanced Pro 0",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 42800, weight: 7.0,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(TCR_GEO), scenarioTags: TAG_CLIMB,
      specs: sWrap(TCR_PRO0),
      image: IMG.race_solo,
      description: "经典全能爬坡战车 Pro 级，Advanced Pro-Grade 碳纤维 + Ultegra Di2，刚性重量比极致。",
    },
    {
      model: "TCR Advanced Pro 1",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 28800, weight: 7.4,
      groupset: "Shimano 105 Di2 R7170",
      reachStack: geo(TCR_GEO), scenarioTags: tags(["爬坡", "竞速训练", "通勤"]),
      specs: sWrap(TCR_PRO1),
      image: IMG.race_sprint,
      description: "TCR Pro 碳纤维车架 + 105 Di2 电子变速，以合理价格获得顶级爬坡几何。",
    },
    {
      model: "TCR Advanced 2",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 16800, weight: 8.1,
      groupset: "Shimano 105 R7100",
      reachStack: geo(TCR_GEO), scenarioTags: tags(["爬坡", "通勤", "竞速训练"]),
      specs: sWrap(TCR_ADV2),
      image: IMG.race_descent,
      description: "万元级碳纤维公路车标杆，105 机械变速 + Advanced 碳纤维车架，进阶车友的第一选择。",
    },
    // Propel
    {
      model: "Propel Advanced SL 0",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 78800, weight: 7.1,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: geo(PROPEL_GEO), scenarioTags: TAG_AERO,
      specs: sWrap(PROPEL_SL0),
      image: IMG.aero_profile,
      description: "纯气动破风旗舰，AeroSystem 管型 + Cadex 65 Aero 高框碳轮 + Dura-Ace Di2。平路巡航的绝对王者。",
    },
    {
      model: "Propel Advanced Pro 1",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 48800, weight: 7.5,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(PROPEL_GEO), scenarioTags: TAG_AERO,
      specs: sWrap(PROPEL_PRO1),
      image: IMG.race_solo,
      description: "Propel Pro 级气动战车，SLR 1 50 碳轮 + Ultegra Di2，风洞验证的气动效率 + 合理价格。",
    },
    {
      model: "Propel Advanced 1",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 32800, weight: 7.9,
      groupset: "Shimano 105 Di2 R7170",
      reachStack: geo(PROPEL_GEO), scenarioTags: tags(["平路巡航", "竞速训练"]),
      specs: sWrap(PROPEL_ADV1),
      image: IMG.aero_profile,
      description: "气动入门战车，Advanced 碳纤维 + 105 Di2 + SLR 2 50 碳轮，平路速度的性价比之选。",
    },
    // Defy
    {
      model: "Defy Advanced Pro 0",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 38800, weight: 7.7,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(DEFY_GEO), scenarioTags: TAG_ENDURANCE,
      specs: sWrap(DEFY_PRO0),
      image: IMG.endure_open,
      description: "长途耐力旗舰，Pro-Grade 碳纤维 + D-Fuse 吸震座管 + Ultegra Di2。38mm 胎宽兼容，全天候舒适。",
    },
    {
      model: "Defy Advanced 1",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 22800, weight: 8.2,
      groupset: "Shimano 105 Di2 R7170",
      reachStack: geo(DEFY_GEO), scenarioTags: tags(["长途耐力", "通勤"]),
      specs: sWrap(DEFY_ADV1),
      image: IMG.endure_city,
      description: "耐力入门碳纤维，Advanced-Grade 碳纤维 + 105 Di2。舒适几何 + 宽胎兼容，百公里骑行毫无压力。",
    },
    // Revolt
    {
      model: "Revolt Advanced Pro 0",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 36800, weight: 8.6,
      groupset: "Shimano GRX Di2 RX825",
      reachStack: geo(REVOLT_GEO), scenarioTags: TAG_GRAVEL,
      specs: sWrap(REVOLT_PRO0),
      image: IMG.gravel_dirt,
      description: "砾石竞赛旗舰，Pro 碳纤维 + GRX Di2 + 碳纤维轮组。45mm 胎宽 + 多处挂载点，全地形探险利器。",
    },
    {
      model: "Revolt Advanced 1",
      brandId: giant.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 18800, weight: 9.3,
      groupset: "Shimano GRX RX820",
      reachStack: geo(REVOLT_GEO), scenarioTags: tags(["碎石路", "冒险骑行"]),
      specs: sWrap(REVOLT_ADV1),
      image: IMG.gravel_trail,
      description: "入门碳纤维砾石车，Advanced 碳纤维 + GRX 机械变速。开启砾石探险的最低门槛碳纤维战车。",
    },

    // ═══════════ TREK (10 款) ═══════════
    {
      model: "Madone SLR 9 Gen 8",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 96800, weight: 6.8,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: geo(MADONE_GEO), scenarioTags: TAG_AERO,
      specs: sWrap(MADONE_SLR9),
      image: IMG.aero_profile,
      description: "第八代 Madone 旗舰，IsoFlow 空气动力学破风车架 + 800 OCLV 碳纤维 + Dura-Ace Di2。世巡赛大组冲刺首选。",
    },
    {
      model: "Madone SLR 7 Gen 8",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 68800, weight: 7.2,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: geo(MADONE_GEO), scenarioTags: TAG_AERO,
      specs: sWrap(MADONE_SLR7),
      image: IMG.race_solo,
      description: "Madone SLR 次旗舰，同样 800 OCLV 碳纤维 + IsoFlow，Ultegra Di2 配置带来极高的速度/价格比。",
    },
    {
      model: "Madone SL 6 Gen 8",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 32980, weight: 8.0,
      groupset: "Shimano 105 Di2 R7170",
      reachStack: geo(MADONE_GEO), scenarioTags: tags(["平路巡航", "竞速训练", "通勤"]),
      specs: sWrap(MADONE_SL6),
      image: IMG.race_sprint,
      description: "Madone SL 入门电子变速版，500 OCLV 碳纤维 + 105 Di2，享受 IsoFlow 气动科技的最低门槛。",
    },
    {
      model: "Madone SL 5 Gen 8",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 22980, weight: 8.5,
      groupset: "Shimano 105 R7100",
      reachStack: geo(MADONE_GEO), scenarioTags: tags(["平路巡航", "通勤"]),
      specs: sWrap(MADONE_SL5),
      image: IMG.race_descent,
      description: "Madone 碳纤维入门，500 OCLV + 105 机械变速。体验气动公路车的超值之选。",
    },
    // Domane
    {
      model: "Domane SLR 9",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 88800, weight: 7.3,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: geo(DOMANE_GEO), scenarioTags: TAG_ENDURANCE,
      specs: sWrap(DOMANE_SLR9),
      image: IMG.endure_open,
      description: "古典赛王者之选，800 OCLV + IsoSpeed 后避震 + Dura-Ace Di2。巴黎-鲁贝同款，石板路也如丝般顺滑。",
    },
    {
      model: "Domane SL 6",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 28990, weight: 8.3,
      groupset: "Shimano 105 Di2 R7170",
      reachStack: geo(DOMANE_GEO), scenarioTags: tags(["长途耐力", "通勤", "休闲骑行"]),
      specs: sWrap(DOMANE_SL6),
      image: IMG.endure_city,
      description: "耐力碳纤维中坚，500 OCLV + IsoSpeed + 105 Di2。百公里以上骑行的最佳伴侣。",
    },
    {
      model: "Domane AL 5",
      brandId: trek.id,
      frameMaterial: "aluminum", brakeSystem: "disc",
      price: 14800, weight: 9.4,
      groupset: "Shimano 105 R7100",
      reachStack: geo(DOMANE_GEO), scenarioTags: tags(["通勤", "长途耐力"]),
      specs: sWrap(DOMANE_AL5),
      image: IMG.endure_open,
      description: "耐力入门铝架，300 Alpha 铝合金 + IsoSpeed + 105 机械变速。万元级最长距离舒适之选。",
    },
    // Checkpoint
    {
      model: "Checkpoint SLR 9",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 82800, weight: 8.1,
      groupset: "SRAM Red eTap AXS",
      reachStack: geo(CHECKPOINT_GEO), scenarioTags: TAG_GRAVEL_SPORT,
      specs: sWrap(CHECKPOINT_SLR9),
      image: IMG.gravel_dirt,
      description: "砾石竞赛终极武器，800 OCLV + IsoSpeed + SRAM Red AXS XPLR。Unbound 大赛领奖台配置。",
    },
    {
      model: "Checkpoint SL 5",
      brandId: trek.id,
      frameMaterial: "carbon", brakeSystem: "disc",
      price: 23890, weight: 9.2,
      groupset: "Shimano GRX RX820",
      reachStack: geo(CHECKPOINT_GEO), scenarioTags: TAG_GRAVEL,
      specs: sWrap(CHECKPOINT_SL5),
      image: IMG.gravel_trail,
      description: "碳纤维砾石中坚，500 OCLV + IsoSpeed + GRX 机械变速。45mm 胎宽 + 多处挂载点，全能探险利器。",
    },
    {
      model: "Checkpoint ALR 5",
      brandId: trek.id,
      frameMaterial: "aluminum", brakeSystem: "disc",
      price: 16800, weight: 10.1,
      groupset: "Shimano GRX RX820",
      reachStack: geo(CHECKPOINT_GEO), scenarioTags: tags(["碎石路", "冒险骑行", "通勤"]),
      specs: sWrap(CHECKPOINT_ALR5),
      image: IMG.gravel_mtb,
      description: "铝合金砾石战车，300 Alpha 铝合金 + GRX 机械变速。以最低预算踏入全地形探险世界。",
    },
  ];

  for (const bike of bikes) {
    await prisma.bike.create({ data: bike });
  }

  console.log(`全部注入完成: ${bikes.length} 款车型`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
