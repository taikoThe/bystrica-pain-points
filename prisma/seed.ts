import { PrismaClient, ReportStatus, Severity, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Výtlky a poškodené cesty", slug: "potholes", icon: "construction", color: "#EF4444", sortOrder: 1 },
  { name: "Nefunkčné osvetlenie", slug: "streetlights", icon: "lightbulb-off", color: "#F59E0B", sortOrder: 2 },
  { name: "Nelegálne skládky", slug: "illegal-dumping", icon: "trash-2", color: "#84CC16", sortOrder: 3 },
  { name: "Grafity a vandalizmus", slug: "graffiti", icon: "spray-can", color: "#A855F7", sortOrder: 4 },
  { name: "Poškodený mestský mobiliár", slug: "furniture", icon: "armchair", color: "#EC4899", sortOrder: 5 },
  { name: "Poškodené chodníky", slug: "sidewalks", icon: "footprints", color: "#F97316", sortOrder: 6 },
  { name: "Dopravné značenie", slug: "traffic-signs", icon: "triangle-alert", color: "#06B6D4", sortOrder: 7 },
  { name: "Nebezpečné priechody", slug: "crossings", icon: "shield-alert", color: "#DC2626", sortOrder: 8 },
  { name: "Verejná zeleň", slug: "greenery", icon: "tree-pine", color: "#22C55E", sortOrder: 9 },
  { name: "Voda a kanalizácia", slug: "water-drainage", icon: "droplets", color: "#3B82F6", sortOrder: 10 },
  { name: "Zimná údržba", slug: "winter-maintenance", icon: "snowflake", color: "#67E8F9", sortOrder: 11 },
  { name: "Iné", slug: "other", icon: "circle-help", color: "#6B7280", sortOrder: 12 },
];

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.adminAction.deleteMany();
  await prisma.confirmation.deleteMany();
  await prisma.reportUpdate.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const createdCategories = await Promise.all(
    categories.map((cat) => prisma.category.create({ data: cat }))
  );
  const catMap = Object.fromEntries(createdCategories.map((c) => [c.slug, c.id]));
  console.log(`Created ${createdCategories.length} categories`);

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Katarína Horváthová",
      email: "admin@bystrica.sk",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const moderator = await prisma.user.create({
    data: {
      name: "Peter Kováč",
      email: "moderator@bystrica.sk",
      passwordHash,
      role: Role.MODERATOR,
    },
  });

  const citizen1 = await prisma.user.create({
    data: {
      name: "Jana Nováková",
      email: "jana@email.sk",
      passwordHash,
      role: Role.CITIZEN,
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      name: "Marek Tóth",
      email: "marek@email.sk",
      passwordHash,
      role: Role.CITIZEN,
    },
  });

  const citizen3 = await prisma.user.create({
    data: {
      name: "Zuzana Kučerová",
      email: "zuzana@email.sk",
      passwordHash,
      role: Role.CITIZEN,
    },
  });

  console.log("Created users (all passwords: password123)");

  // Reports around Banská Bystrica center
  const reports = [
    {
      title: "Veľký výtlk na Námestí SNP",
      description: "Na hlavnom námestí pri fontáne sa nachádza veľký výtlk, ktorý je nebezpečný pre chodcov aj cyklistov. Výtlk má priemer asi 50cm a hĺbku 15cm.",
      categorySlug: "potholes",
      status: ReportStatus.IN_PROGRESS,
      severity: Severity.HIGH,
      latitude: 48.7363,
      longitude: 19.1461,
      address: "Námestie SNP 1, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Nefunkčná lampa na Kapitulskej",
      description: "Pouličná lampa pred č. 12 nesvieti už tretí týždeň. Ulica je v noci veľmi tmavá a nebezpečná.",
      categorySlug: "streetlights",
      status: ReportStatus.ACCEPTED,
      severity: Severity.MEDIUM,
      latitude: 48.7375,
      longitude: 19.1445,
      address: "Kapitulská 12, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Nelegálna skládka za Hušťákom",
      description: "Za obchodným centrom Hušťák niekto vyviezol stavebný odpad a staré pneumatiky. Skládka rastie a začína zapáchať.",
      categorySlug: "illegal-dumping",
      status: ReportStatus.NEW,
      severity: Severity.HIGH,
      latitude: 48.7340,
      longitude: 19.1420,
      address: "Za Hušťákom, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Grafity na budove školy",
      description: "Na fasáde základnej školy na Bakossovej ulici sa objavili veľkoplošné grafity. Budova bola nedávno zrekonštruovaná.",
      categorySlug: "graffiti",
      status: ReportStatus.UNDER_REVIEW,
      severity: Severity.LOW,
      latitude: 48.7350,
      longitude: 19.1500,
      address: "Bakossova 5, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Rozbitá lavička v parku",
      description: "V Mestskom parku je rozbitá lavička pri jazierku. Chýba sedacia časť a vyčnievajú ostré hrany.",
      categorySlug: "furniture",
      status: ReportStatus.RESOLVED,
      severity: Severity.MEDIUM,
      latitude: 48.7380,
      longitude: 19.1510,
      address: "Mestský park, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Prepadnutý chodník na Skuteckého",
      description: "Na Skuteckého ulici sa chodník prepadol na úseku asi 3 metre. Vznikla jama hlboká asi 10cm. Riziko pádu, najmä pre starších ľudí.",
      categorySlug: "sidewalks",
      status: ReportStatus.NEW,
      severity: Severity.HIGH,
      latitude: 48.7355,
      longitude: 19.1430,
      address: "Skuteckého 8, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Otočená značka STOP",
      description: "Dopravná značka STOP na križovatke Tajovského a Hornej ulice je otočená o 90 stupňov, pravdepodobne po náraze vozidla.",
      categorySlug: "traffic-signs",
      status: ReportStatus.ACCEPTED,
      severity: Severity.CRITICAL,
      latitude: 48.7345,
      longitude: 19.1475,
      address: "Tajovského / Horná, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Nebezpečný priechod na Záhradnej",
      description: "Priechod pre chodcov na Záhradnej ulici nemá značenie a nie je dostatočne osvetlený. V ranných hodinách je takmer neviditeľný pre vodičov.",
      categorySlug: "crossings",
      status: ReportStatus.IN_PROGRESS,
      severity: Severity.CRITICAL,
      latitude: 48.7370,
      longitude: 19.1490,
      address: "Záhradná ulica, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Padajúce konáre v parku",
      description: "Niekoľko stromov v Mestskom parku má suché a pololámané konáre, ktoré hrozia pádom. V parku sa pohybujú deti.",
      categorySlug: "greenery",
      status: ReportStatus.UNDER_REVIEW,
      severity: Severity.HIGH,
      latitude: 48.7385,
      longitude: 19.1505,
      address: "Mestský park, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Upchatá kanalizácia na Dolnej",
      description: "Pri daždi sa na Dolnej ulici tvorí veľká kaluž, pretože kanalizácia je upchatá listím a odpadom. Voda siaha až na chodník.",
      categorySlug: "water-drainage",
      status: ReportStatus.NEW,
      severity: Severity.MEDIUM,
      latitude: 48.7358,
      longitude: 19.1440,
      address: "Dolná 25, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Výtlk na Sládkovičovej ulici",
      description: "Na Sládkovičovej ulici pri autobusovej zastávke je hlboký výtlk, ktorý spôsobuje problémy autom aj autobusom MHD.",
      categorySlug: "potholes",
      status: ReportStatus.NEW,
      severity: Severity.MEDIUM,
      latitude: 48.7330,
      longitude: 19.1455,
      address: "Sládkovičova, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Zničený odpadkový kôš na Trojičnom námestí",
      description: "Odpadkový kôš na Trojičnom námestí je úplne zničený a odpad sa z neho vysypáva na chodník.",
      categorySlug: "furniture",
      status: ReportStatus.RESOLVED,
      severity: Severity.LOW,
      latitude: 48.7367,
      longitude: 19.1468,
      address: "Trojičné námestie, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Poškodené zábradlie na moste",
      description: "Zábradlie na pešom moste cez Hron pri Štadlerovom parku je na jednom mieste úplne odtrhnuté. Hrozí pád do rieky.",
      categorySlug: "furniture",
      status: ReportStatus.IN_PROGRESS,
      severity: Severity.CRITICAL,
      latitude: 48.7395,
      longitude: 19.1470,
      address: "Peší most pri Štadlerovom parku, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Nefunkčné osvetlenie parkoviska",
      description: "Na parkovisku za polikliniku nefunguje osvetlenie. V noci je parkovisko úplne tmavé.",
      categorySlug: "streetlights",
      status: ReportStatus.NEW,
      severity: Severity.MEDIUM,
      latitude: 48.7340,
      longitude: 19.1500,
      address: "Parkovisko, Cesta k nemocnici, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Neudržiavaná zeleň na kruhovom objazde",
      description: "Kruháč pri Lidli má zarastenú zeleň, ktorá zhoršuje výhľad vodičom pri vjazde na kruhový objazd.",
      categorySlug: "greenery",
      status: ReportStatus.ACCEPTED,
      severity: Severity.MEDIUM,
      latitude: 48.7315,
      longitude: 19.1435,
      address: "Kruhový objazd, Nový Svet, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Veľký výtlk na ulici 9. mája",
      description: "Obrovský výtlk na ulici 9. mája blízko železničnej stanice. Auto sa v ňom môže ľahko poškodiť.",
      categorySlug: "potholes",
      status: ReportStatus.RESOLVED,
      severity: Severity.HIGH,
      latitude: 48.7310,
      longitude: 19.1460,
      address: "Ulica 9. mája, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Chýbajúci poklop kanalizácie",
      description: "Na Lazovnej ulici chýba poklop kanalizácie. Otvor je len provizórne zakrytý doskou. Extrémne nebezpečné!",
      categorySlug: "water-drainage",
      status: ReportStatus.IN_PROGRESS,
      severity: Severity.CRITICAL,
      latitude: 48.7348,
      longitude: 19.1412,
      address: "Lazovná 18, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Grafity na autobusovej zastávke",
      description: "Zastávka MHD Fončorda, sklenené steny pospisované grafitami. Prístrešok je celkovo v zlom stave.",
      categorySlug: "graffiti",
      status: ReportStatus.REJECTED,
      severity: Severity.LOW,
      latitude: 48.7290,
      longitude: 19.1380,
      address: "Zastávka Fončorda, Banská Bystrica",
      userId: null,
      isAnonymous: true,
    },
    {
      title: "Poškodený chodník na Internátnej",
      description: "Chodník na Internátnej ulici pri UMB je rozbitý a nerovný. Korene stromov ho dvíhajú na viacerých miestach.",
      categorySlug: "sidewalks",
      status: ReportStatus.UNDER_REVIEW,
      severity: Severity.MEDIUM,
      latitude: 48.7325,
      longitude: 19.1490,
      address: "Internátna ulica, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Prevrátená lavička na detskom ihrisku",
      description: "Na detskom ihrisku na Fončorde je prevrátená lavička s vyčnievajúcimi skrutkami. Riziko zranenia detí.",
      categorySlug: "furniture",
      status: ReportStatus.NEW,
      severity: Severity.HIGH,
      latitude: 48.7285,
      longitude: 19.1395,
      address: "Detské ihrisko, Fončorda, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Neoznačené výkopové práce",
      description: "Na Hurbanovej ulici prebiehajú výkopové práce, ale nie sú riadne označené. Chýba oplotenie a výstražné značky.",
      categorySlug: "other",
      status: ReportStatus.ACCEPTED,
      severity: Severity.HIGH,
      latitude: 48.7360,
      longitude: 19.1410,
      address: "Hurbanova ulica, Banská Bystrica",
      userId: citizen2.id,
    },
    {
      title: "Spadnutý strom na chodníku",
      description: "Po búrke spadol menší strom na chodník na Malachovskej ceste. Blokuje cestu pre chodcov.",
      categorySlug: "greenery",
      status: ReportStatus.RESOLVED,
      severity: Severity.MEDIUM,
      latitude: 48.7400,
      longitude: 19.1520,
      address: "Malachovská cesta, Banská Bystrica",
      userId: citizen3.id,
    },
    {
      title: "Nelegálne skládky na Uhlisku",
      description: "V okolí bytových domov na Uhlisku sa pravidelne objavujú nelegálne skládky veľkoobjemového odpadu.",
      categorySlug: "illegal-dumping",
      status: ReportStatus.UNDER_REVIEW,
      severity: Severity.MEDIUM,
      latitude: 48.7335,
      longitude: 19.1520,
      address: "Uhlisko, Banská Bystrica",
      userId: null,
      isAnonymous: true,
    },
    {
      title: "Blikajúca lampa na Ceste k nemocnici",
      description: "Lampa pouličného osvetlenia na Ceste k nemocnici neustále bliká. V noci to pôsobí rušivo a neosvetľuje cestu dostatočne.",
      categorySlug: "streetlights",
      status: ReportStatus.NEW,
      severity: Severity.LOW,
      latitude: 48.7345,
      longitude: 19.1505,
      address: "Cesta k nemocnici, Banská Bystrica",
      userId: citizen1.id,
    },
    {
      title: "Nebezpečná križovatka pri Rooseveltovej",
      description: "Križovatka pri Rooseveltovej nemocnici je neprehľadná. Chýba zrkadlo a značenie je opotrebované.",
      categorySlug: "crossings",
      status: ReportStatus.ACCEPTED,
      severity: Severity.HIGH,
      latitude: 48.7350,
      longitude: 19.1510,
      address: "Rooseveltova / Cesta k nemocnici, Banská Bystrica",
      userId: citizen2.id,
    },
  ];

  // Create reports
  const createdReports = [];
  for (const r of reports) {
    const daysAgo = Math.floor(Math.random() * 60);
    const report = await prisma.report.create({
      data: {
        title: r.title,
        description: r.description,
        status: r.status,
        severity: r.severity,
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        categoryId: catMap[r.categorySlug],
        userId: r.userId || null,
        isAnonymous: (r as { isAnonymous?: boolean }).isAnonymous || false,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    createdReports.push(report);
  }
  console.log(`Created ${createdReports.length} reports`);

  // Add confirmations
  const confirmationData = [
    { reportIndex: 0, users: [citizen2.id, citizen3.id] },
    { reportIndex: 2, users: [citizen1.id, citizen2.id] },
    { reportIndex: 5, users: [citizen1.id] },
    { reportIndex: 7, users: [citizen1.id, citizen3.id] },
    { reportIndex: 8, users: [citizen2.id] },
    { reportIndex: 12, users: [citizen2.id, citizen3.id] },
    { reportIndex: 16, users: [citizen1.id, citizen3.id] },
    { reportIndex: 19, users: [citizen2.id] },
  ];

  for (const conf of confirmationData) {
    for (const userId of conf.users) {
      await prisma.confirmation.create({
        data: {
          reportId: createdReports[conf.reportIndex].id,
          userId,
        },
      });
    }
  }
  console.log("Created confirmations");

  // Add updates to some reports
  const updates = [
    {
      reportIndex: 0,
      entries: [
        { content: "Hlásenie prijaté, zaraďujeme do plánu opráv.", daysAgo: 8 },
        { content: "Oprava naplánovaná na budúci týždeň.", daysAgo: 3 },
      ],
    },
    {
      reportIndex: 4,
      entries: [
        { content: "Lavička bola opravená a nainštalovaná.", daysAgo: 5 },
      ],
    },
    {
      reportIndex: 7,
      entries: [
        { content: "Posúdenie priechodu bolo schválené. Začíname s obnovou značenia.", daysAgo: 10 },
        { content: "Značenie obnovené, čakáme na inštaláciu osvetlenia.", daysAgo: 2 },
      ],
    },
    {
      reportIndex: 11,
      entries: [
        { content: "Nový odpadkový kôš bol nainštalovaný.", daysAgo: 3 },
      ],
    },
    {
      reportIndex: 12,
      entries: [
        { content: "Zábradlie bude opravené v rámci plánovanej údržby mostu.", daysAgo: 7 },
      ],
    },
    {
      reportIndex: 15,
      entries: [
        { content: "Výtlk bol opravený asfaltovou záplatou.", daysAgo: 1 },
      ],
    },
    {
      reportIndex: 16,
      entries: [
        { content: "Poklop objednaný, dočasne zabezpečený oceľovou platňou.", daysAgo: 5 },
      ],
    },
    {
      reportIndex: 21,
      entries: [
        { content: "Strom bol odstránený technickými službami.", daysAgo: 2 },
      ],
    },
  ];

  for (const upd of updates) {
    for (const entry of upd.entries) {
      await prisma.reportUpdate.create({
        data: {
          content: entry.content,
          isPublic: true,
          reportId: createdReports[upd.reportIndex].id,
          authorId: admin.id,
          createdAt: new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log("Created report updates");

  console.log("\nSeed completed!");
  console.log("\nLogin credentials:");
  console.log("  Admin:     admin@bystrica.sk / password123");
  console.log("  Moderator: moderator@bystrica.sk / password123");
  console.log("  Citizen:   jana@email.sk / password123");
  console.log("  Citizen:   marek@email.sk / password123");
  console.log("  Citizen:   zuzana@email.sk / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
