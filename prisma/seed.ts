import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { join } from "path";

const dbPath = join(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Brands ---
  const specialized = await prisma.brand.upsert({
    where: { name: "Specialized" },
    update: {},
    create: {
      name: "Specialized",
      country: "USA",
      website: "https://www.specialized.com",
      foundedYear: 1974,
      description:
        "美国顶级自行车品牌，以创新技术和竞赛基因为核心，产品线覆盖公路、山地、Gravel 全场景。",
    },
  });

  const trek = await prisma.brand.upsert({
    where: { name: "Trek" },
    update: {},
    create: {
      name: "Trek",
      country: "USA",
      website: "https://www.trekbikes.com",
      foundedYear: 1976,
      description:
        "美国老牌自行车制造商，以 Madone 空气动力学车系和 Checkpoint 瓜车系列闻名。",
    },
  });

  const giant = await prisma.brand.upsert({
    where: { name: "Giant" },
    update: {},
    create: {
      name: "Giant",
      country: "Taiwan",
      website: "https://www.giant-bicycles.com",
      foundedYear: 1972,
      description:
        "全球最大自行车制造商，自研碳纤维工艺，TCR 车系是爬坡综合架标杆。",
    },
  });

  const pinarello = await prisma.brand.upsert({
    where: { name: "Pinarello" },
    update: {},
    create: {
      name: "Pinarello",
      country: "Italy",
      website: "https://pinarello.com",
      foundedYear: 1952,
      description:
        "意大利传奇品牌，Dogma 系列为世巡赛获奖最多车架之一，非对称设计独树一帜。",
    },
  });

  const cannondale = await prisma.brand.upsert({
    where: { name: "Cannondale" },
    update: {},
    create: {
      name: "Cannondale",
      country: "USA",
      website: "https://www.cannondale.com",
      foundedYear: 1971,
      description:
        "以铝合金车架起家的美国品牌，SuperSix EVO 综合架以轻量高刚性著称。",
    },
  });

  const canyon = await prisma.brand.upsert({
    where: { name: "Canyon" },
    update: {},
    create: {
      name: "Canyon",
      country: "Germany",
      website: "https://www.canyon.com",
      foundedYear: 2001,
      description:
        "德国直销品牌，去掉中间商提供高性价比，Grizl 和 Ultimate 分别是瓜车和爬坡架的代表。",
    },
  });

  const colnago = await prisma.brand.upsert({
    where: { name: "Colnago" },
    update: {},
    create: {
      name: "Colnago",
      country: "Italy",
      website: "https://www.colnago.com",
      foundedYear: 1954,
      description:
        "意大利手工车架传奇，梅花标志是无数车友的终极梦想，V4Rs 为世巡赛车。",
    },
  });

  const bmc = await prisma.brand.upsert({
    where: { name: "BMC" },
    update: {},
    create: {
      name: "BMC",
      country: "Switzerland",
      website: "https://www.bmc-switzerland.com",
      foundedYear: 1986,
      description:
        "瑞士精密制造代表，Teammachine 是世巡赛综合战车标杆，ICS 全内走线先驱。",
    },
  });

  const scott = await prisma.brand.upsert({
    where: { name: "Scott" },
    update: {},
    create: {
      name: "Scott",
      country: "Switzerland",
      website: "https://www.scott-sports.com",
      foundedYear: 1958,
      description:
        "瑞士品牌，Spark 系列是世界杯 XC 赛场的常胜车型，轻量与避震效率的极致平衡。",
    },
  });

  const cervelo = await prisma.brand.upsert({
    where: { name: "Cervelo" },
    update: {},
    create: {
      name: "Cervelo",
      country: "Canada",
      website: "https://www.cervelo.com",
      foundedYear: 1995,
      description:
        "加拿大空气动力学先驱，S5 和 R5 分别为纯气动和纯爬坡代表，工程驱动品牌。",
    },
  });

  console.log("Brands seeded: 10");

  // --- Bikes ---

  const bikes = [
    // ======================== ROAD RACE ========================
    {
      model: "S-Works Tarmac SL8",
      brandId: specialized.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 99990, // RMB
      weight: 6.8,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: JSON.stringify({
        sizes: [
          { size: "49", reach: 375, stack: 504 },
          { size: "52", reach: 380, stack: 517 },
          { size: "54", reach: 384, stack: 534 },
          { size: "56", reach: 392, stack: 555 },
          { size: "58", reach: 402, stack: 578 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "全能综合竞赛战车，世巡赛同款。Fact 12r 碳纤维车架搭配气动优化的前叉和后上叉，刚性重量比业界标杆。",
      image: null,
    },
    {
      model: "Tarmac SL8 Pro",
      brandId: specialized.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 59990,
      weight: 7.2,
      groupset: "SRAM Force AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "49", reach: 375, stack: 504 },
          { size: "52", reach: 380, stack: 517 },
          { size: "54", reach: 384, stack: 534 },
          { size: "56", reach: 392, stack: 555 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "次旗舰 Tarmac，Fact 10r 碳纤维车架，继承 S-Works 几何但更亲和的价格。SRAM Force 无线电变。",
      image: null,
    },
    {
      model: "Madone SLR 9 Gen 8",
      brandId: trek.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 96800,
      weight: 7.0,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: JSON.stringify({
        sizes: [
          { size: "50", reach: 374, stack: 515 },
          { size: "52", reach: 379, stack: 528 },
          { size: "54", reach: 382, stack: 542 },
          { size: "56", reach: 387, stack: 561 },
          { size: "58", reach: 395, stack: 582 },
        ],
      }),
      scenarioTags: JSON.stringify(["平路巡航", "竞速训练", "比赛竞速"]),
      description:
        "全新第八代 Madone，IsoFlow 空气动力学破风车架，兼顾轻量与气动效率的顶级竞赛机器。",
      image: null,
    },
    {
      model: "Madone SL 6 Gen 8",
      brandId: trek.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 32980,
      weight: 8.3,
      groupset: "Shimano 105 R7170 Di2",
      reachStack: JSON.stringify({
        sizes: [
          { size: "50", reach: 374, stack: 515 },
          { size: "52", reach: 379, stack: 528 },
          { size: "54", reach: 382, stack: 542 },
          { size: "56", reach: 387, stack: 561 },
          { size: "58", reach: 395, stack: 582 },
        ],
      }),
      scenarioTags: JSON.stringify(["平路巡航", "竞速训练", "通勤"]),
      description:
        "Madone Gen 8 入门碳纤维版本，500 系列 OCLV 碳纤维，105 电子变速 + 气动车架的高性价比组合。",
      image: null,
    },
    {
      model: "TCR Advanced Pro 0",
      brandId: giant.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 42800,
      weight: 7.0,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: JSON.stringify({
        sizes: [
          { size: "S", reach: 378, stack: 517 },
          { size: "M", reach: 383, stack: 535 },
          { size: "ML", reach: 393, stack: 558 },
          { size: "L", reach: 402, stack: 582 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "放坡", "竞速训练"]),
      description:
        "经典全能爬坡战车第十代，Advanced SL-Grade 碳纤维，Ultegra Di2 电子变速，刚性重量比极致。",
      image: null,
    },
    {
      model: "TCR Advanced 2",
      brandId: giant.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 16800,
      weight: 8.1,
      groupset: "Shimano 105 R7100",
      reachStack: JSON.stringify({
        sizes: [
          { size: "S", reach: 378, stack: 517 },
          { size: "M", reach: 383, stack: 535 },
          { size: "ML", reach: 393, stack: 558 },
          { size: "L", reach: 402, stack: 582 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "通勤", "竞速训练"]),
      description:
        "万元级入门碳纤维公路车标杆，Shimano 105 机械变速，是进阶车友的热门之选。",
      image: null,
    },
    {
      model: "Dogma F",
      brandId: pinarello.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 108000,
      weight: 6.9,
      groupset: "SRAM Red AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "46.5", reach: 373, stack: 494 },
          { size: "50", reach: 377, stack: 515 },
          { size: "53", reach: 383, stack: 532 },
          { size: "55", reach: 389, stack: 551 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "意大利国宝级竞赛车架。非对称设计与 Torayca M40X 碳纤维，SRAM Red AXS 旗舰无线电变。",
      image: null,
    },
    {
      model: "SuperSix EVO Hi-MOD 1",
      brandId: cannondale.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 56800,
      weight: 7.3,
      groupset: "SRAM Red eTap AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "48", reach: 372, stack: 508 },
          { size: "51", reach: 378, stack: 523 },
          { size: "54", reach: 383, stack: 543 },
          { size: "56", reach: 390, stack: 562 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "美国轻量爬坡架代表，Hi-MOD 高模量碳纤维，极致轻量与高刚性的完美平衡。",
      image: null,
    },
    {
      model: "Ultimate CF SL 8",
      brandId: canyon.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 36800,
      weight: 7.2,
      groupset: "Shimano Ultegra R8170 Di2",
      reachStack: JSON.stringify({
        sizes: [
          { size: "XS", reach: 370, stack: 510 },
          { size: "S", reach: 379, stack: 531 },
          { size: "M", reach: 388, stack: 553 },
          { size: "L", reach: 397, stack: 576 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练"]),
      description:
        "德国直销爬坡综合架，超高性价比 Ultegra Di2 配置，CP0018 一体把内走线简洁利落。",
      image: null,
    },
    {
      model: "V4Rs",
      brandId: colnago.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 96800,
      weight: 7.0,
      groupset: "Shimano Dura-Ace Di2 R9270",
      reachStack: JSON.stringify({
        sizes: [
          { size: "45s", reach: 376, stack: 500 },
          { size: "48s", reach: 382, stack: 519 },
          { size: "50s", reach: 389, stack: 540 },
          { size: "52s", reach: 396, stack: 556 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "梅花现役世巡赛战车，UAE Team Emirates 同款。意大利手工涂装 + 顶级碳纤维，兼具性能与收藏价值。",
      image: null,
    },
    {
      model: "Teammachine SLR01",
      brandId: bmc.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 86800,
      weight: 6.8,
      groupset: "SRAM Red AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "47", reach: 375, stack: 506 },
          { size: "51", reach: 383, stack: 528 },
          { size: "54", reach: 388, stack: 547 },
          { size: "56", reach: 393, stack: 565 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "瑞士精密工程代表作，ICS Carbon Aero 全隐藏走线，Aerocore 气动水壶架设计，综合性能拉满。",
      image: null,
    },
    {
      model: "R5",
      brandId: cervelo.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 62800,
      weight: 6.9,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: JSON.stringify({
        sizes: [
          { size: "48", reach: 360, stack: 505 },
          { size: "51", reach: 369, stack: 530 },
          { size: "54", reach: 378, stack: 555 },
          { size: "56", reach: 387, stack: 580 },
        ],
      }),
      scenarioTags: JSON.stringify(["爬坡", "竞速训练", "比赛竞速"]),
      description:
        "加拿大纯爬坡战车，Jumbo-Visma 车队同款几何。极致的轻量与刚性，专为高山赛段设计。",
      image: null,
    },

    // ======================== ENDURANCE ========================
    {
      model: "Domane SL 6",
      brandId: trek.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 28990,
      weight: 8.6,
      groupset: "Shimano 105 R7170 Di2",
      reachStack: JSON.stringify({
        sizes: [
          { size: "50", reach: 371, stack: 546 },
          { size: "52", reach: 374, stack: 561 },
          { size: "54", reach: 378, stack: 575 },
          { size: "56", reach: 382, stack: 591 },
        ],
      }),
      scenarioTags: JSON.stringify(["长途耐力", "通勤", "休闲骑行"]),
      description:
        "古典赛耐力车型，IsoSpeed 减震技术 + 32mm 宽胎间隙，长距离舒适性极佳。",
      image: null,
    },
    {
      model: "Roubaix SL8 Expert",
      brandId: specialized.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 39990,
      weight: 8.2,
      groupset: "SRAM Rival eTap AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "49", reach: 372, stack: 530 },
          { size: "52", reach: 377, stack: 549 },
          { size: "54", reach: 382, stack: 569 },
          { size: "56", reach: 389, stack: 592 },
        ],
      }),
      scenarioTags: JSON.stringify(["长途耐力", "放坡", "休闲骑行"]),
      description:
        "巴黎-鲁贝冠军血脉，Future Shock 3.0 头管避震 + 后上叉弹性形变，石板路也如履平地。",
      image: null,
    },
    {
      model: "Defy Advanced Pro 1",
      brandId: giant.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 34800,
      weight: 8.0,
      groupset: "Shimano Ultegra Di2 R8170",
      reachStack: JSON.stringify({
        sizes: [
          { size: "S", reach: 375, stack: 525 },
          { size: "M", reach: 381, stack: 545 },
          { size: "ML", reach: 388, stack: 568 },
          { size: "L", reach: 396, stack: 593 },
        ],
      }),
      scenarioTags: JSON.stringify(["长途耐力", "通勤", "休闲骑行"]),
      description:
        "Giant 耐力车系，D-Fuse 座管 + 碳纤维车架吸震，38mm 胎宽支持轻度碎石路面。",
      image: null,
    },

    // ======================== GRAVEL ========================
    {
      model: "Grizl CF SL 8",
      brandId: canyon.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 24990,
      weight: 9.2,
      groupset: "Shimano GRX RX822 Di2",
      reachStack: JSON.stringify({
        sizes: [
          { size: "XS", reach: 385, stack: 533 },
          { size: "S", reach: 393, stack: 550 },
          { size: "M", reach: 401, stack: 570 },
          { size: "L", reach: 410, stack: 593 },
        ],
      }),
      scenarioTags: JSON.stringify(["碎石路", "长途重装", "冒险骑行"]),
      description:
        "纯正 Gravel 战车，50mm 胎宽 + 全地形几何，上管/下管多处挂载点，支持长途重装探险。",
      image: null,
    },
    {
      model: "Diverge STR Expert",
      brandId: specialized.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 46800,
      weight: 8.9,
      groupset: "SRAM Rival eTap AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "49", reach: 375, stack: 544 },
          { size: "52", reach: 380, stack: 562 },
          { size: "54", reach: 385, stack: 584 },
          { size: "56", reach: 392, stack: 606 },
        ],
      }),
      scenarioTags: JSON.stringify(["碎石路", "长途重装", "冒险骑行"]),
      description:
        "Future Shock + 后部弹性形变双避震系统，47mm 胎宽，是 Gravel 长距离舒适性王者。",
      image: null,
    },
    {
      model: "Checkpoint SL 5",
      brandId: trek.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 23890,
      weight: 9.5,
      groupset: "Shimano GRX RX820",
      reachStack: JSON.stringify({
        sizes: [
          { size: "49", reach: 384, stack: 536 },
          { size: "52", reach: 389, stack: 552 },
          { size: "54", reach: 393, stack: 571 },
          { size: "56", reach: 398, stack: 592 },
        ],
      }),
      scenarioTags: JSON.stringify(["碎石路", "长途重装", "通勤"]),
      description:
        "Trek 瓜车，IsoSpeed 后避震 + 多处挂载孔，45mm 胎宽，兼顾速度与全地形通过性。",
      image: null,
    },

    // ======================== MOUNTAIN (XC) ========================
    {
      model: "Spark RC 900",
      brandId: scott.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 59800,
      weight: 10.3,
      groupset: "SRAM XX SL AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "S", reach: 400, stack: 584 },
          { size: "M", reach: 420, stack: 594 },
          { size: "L", reach: 440, stack: 604 },
        ],
      }),
      scenarioTags: JSON.stringify(["山地竞速", "越野骑行", "爬坡"]),
      description:
        "世界杯 XC 冠军战车，HMX-SL 超轻碳纤维 + 120mm 行程，TwinLoc 三档线控避震。",
      image: null,
    },
    {
      model: "Epic 8 EVO Pro",
      brandId: specialized.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 46990,
      weight: 11.0,
      groupset: "SRAM GX AXS",
      reachStack: JSON.stringify({
        sizes: [
          { size: "S", reach: 403, stack: 596 },
          { size: "M", reach: 428, stack: 606 },
          { size: "L", reach: 453, stack: 616 },
        ],
      }),
      scenarioTags: JSON.stringify(["山地竞速", "越野骑行", "放坡"]),
      description:
        "Epic 8 林道版，120mm 前后行程，FACT 11m 碳纤维车架，效率与山地乐趣兼顾。",
      image: null,
    },
    {
      model: "Procaliber 9.6",
      brandId: trek.id,
      frameMaterial: "carbon",
      brakeSystem: "disc",
      price: 22980,
      weight: 10.8,
      groupset: "Shimano Deore XT M8100",
      reachStack: JSON.stringify({
        sizes: [
          { size: "S", reach: 395, stack: 580 },
          { size: "M", reach: 415, stack: 590 },
          { size: "L", reach: 435, stack: 600 },
          { size: "XL", reach: 455, stack: 610 },
        ],
      }),
      scenarioTags: JSON.stringify(["山地竞速", "越野骑行"]),
      description:
        "Trek 硬尾 XC，IsoSpeed 减震器 + OCLV 碳纤维，Shimano Deore XT 1x12 经典传动。",
      image: null,
    },
  ];

  for (const bike of bikes) {
    await prisma.bike.create({ data: bike });
  }

  console.log(`Bikes seeded: ${bikes.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
