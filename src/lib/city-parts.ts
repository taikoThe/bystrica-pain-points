// Official street-to-city-part mapping from banskabystrica.sk
// Source: https://www.banskabystrica.sk (Mestské časti)

const CITY_PART_STREETS: Record<string, string[]> = {
  "Banská Bystrica": [
    "29. augusta", "Alexandra Matušku", "Astrová", "Azalková", "Bakossova",
    "Cesta k nemocnici", "Cesta k Smrečine", "Cesta na amfiteáter",
    "Cesta na štadión", "Cmárovo", "Československej armády", "Dobšinského",
    "Dolná", "Dolná Strieborná", "F. Švantnera", "Figuša Bystrého",
    "Gerberová", "Hečkova", "Horná", "Horná Strieborná", "Horné záhrady",
    "Hurbanova", "Hutná", "J. Cikkera", "Jána Bottu", "Jána Chalupku",
    "Janka Kráľa", "Jegorovova", "Kapitulská", "Katovná",
    "Kláry Jarunkovej", "Kollárova", "Komenského", "Krížna", "Kukučínova",
    "Kuzmányho", "Ladislava Hudeca", "Laskomerská", "Lazovná",
    "Ľuda Ondrejova", "M. Hattalu", "M. M. Hodžu", "M. Rázusa",
    "Medený Hámor", "Mikuláša Kováča", "Murgašova", "Muškátová",
    "Na Graniari", "Na Karlove", "Na Troskách", "Nad plážou",
    "Námestie slobody", "Námestie Štefana Moyzesa", "Námestie Ludvíka Svobodu",
    "Námestie SNP", "Národná", "Partizánska cesta", "Petelenova",
    "Petra Karvaša", "Pod Jesenským vŕškom", "Pod vysielačom",
    "Profesora Sáru", "Robotnícka", "Rudlovská cesta",
    "Ruttkaya Nedeckého", "Severná", "Skuteckého", "Slnečné stráne",
    "Stoličková", "Strieborné námestie", "Šimona Jurovského", "Školská",
    "Šoltésovej", "Štadlerovo nábrežie", "Štefánikovo nábrežie",
    "Tajovského", "Terézie Vansovej", "Tibora Andrašovana", "Trieda SNP",
    "Vajanského námestie", "Záhradná", "Zvončeková", "Železničiarska",
  ],
  "Majer": ["Majerská cesta", "Stavebná"],
  "Senica": ["Cementárenská cesta", "Na Hrbe", "Senická cesta"],
  "Šalková": [
    "Fraňa Kráľa", "Hronská", "Jiráskova", "Ľupčianska", "Mieru",
    "Podjavorinskej", "Poľovnícka", "Ponická", "Priemyselná",
    "Šalkovská cesta", "Technická",
  ],
  "Uhlisko": [
    "9. mája", "Bellušova", "Boženy Němcovej", "Družstevná", "Golianova",
    "Hronské predmestie", "Hviezdoslavova", "Jesenského", "Lesná",
    "Mičinská cesta", "Na Starej tehelni", "Na Uhlisku", "Pod Kalváriou",
    "Pod rybou", "Pod Turíčkou", "Pod Urpínom", "Timravy", "Viestova",
    "Žltý piesok",
  ],
  "Rudlová": [
    "Dedinská", "Ďumbierska", "Fatranská", "Gerlachovská", "Chabenecká",
    "Kapitána Jaroša", "Marka Čulena", "Mladých budovateľov", "Odbojárov",
    "Pod Banošom", "Pod Hôrkou", "Rudelinova", "Rudlovská cesta", "Ružová",
    "Starohorská", "Strmá", "Zdenka Mikulu",
  ],
  "Sásová": [
    "Agátová", "Borová", "Dubová", "Ďumbierska", "Garbanka", "Haškova",
    "Hlboká", "Inovecká", "Javornícka", "Karpatská", "Kráľovohoľská",
    "Krivánska", "Magurská", "Mateja Bela", "Na Dolinky", "Na plaváreň",
    "Na Skalici", "Na Tále", "Na Zábave", "Pieninská", "Pod cintorínom",
    "Pod Skalkou", "Rudohorská", "Sásovská cesta", "Sitnianska", "Stránska",
    "Strážovská", "Surovská", "Tatranská", "Veterná",
  ],
  "Jakub": [
    "Harmanecká cesta", "Hrušková", "Jakubská cesta", "Nový Svet", "Ovocná",
  ],
  "Kostiviarska": ["Jelšová", "Kostiviarska cesta", "Topoľová"],
  "Podlavice": [
    "Gaštanová", "Jaseňová", "Javorová", "Jedľová", "Limbová", "Lipová",
    "Lúčičky", "Na Lúčkach", "Pestovateľská", "Pod Dúbravou",
    "Podlavická cesta", "Povstalecká cesta", "Priehrada", "Ulička", "Višňová",
  ],
  "Skubín": [
    "Buková", "Mlynská", "Na Čiertolí", "Na úbočí", "Pod Stráňou",
    "Skubínska cesta", "Záhumnie", "Závoz",
  ],
  "Uľanka": ["Jozefa Mistríka", "Uľanská cesta"],
  "Fončorda": [
    "Bagarova", "Dlhá", "Družby", "Gorkého", "Havranské", "Internátna",
    "Jazmínová", "Jilemnického", "Kapitána Nálepku", "Kovačická",
    "Kvetinová", "Kyjevské námestie", "Mládežnícka", "Moskovská",
    "Námestie Ľ. Štúra", "Nešporova", "Nová", "Nové Kalište", "Okružná",
    "Orenburská", "Podbeľová", "Prvosienková", "Sadová", "Slnečná",
    "Spojová", "Šalgotarjánska", "Švermova", "Tichá",
    "Trieda Hradca Králové", "Tulská", "Vršacká", "Wolkerova", "Zadarská",
    "Zelená",
  ],
  "Radvaň": [
    "Bernolákova", "Bočná", "Cintorínska", "Jarná", "Jesenná",
    "Kalinčiakova", "Králická cesta", "Krátka", "Letná",
    "Malachovská cesta", "Na Kútinách", "Na Motyčinách", "Námestie Ľ. Štúra",
    "Ovčiarska", "Pod Suchým vrchom", "Poľná", "Pršianska cesta",
    "Radvanská", "Sládkovičova", "Stredná", "Stromová", "Stupy", "Zimná",
  ],
  "Iliaš": ["Iliašska cesta"],
  "Kráľová": ["Podháj", "Sládkovičova", "Sokolovská", "Zvolenská cesta"],
  "Kremnička": [
    "Borievková", "Brezová", "Čerešňová", "Drienková", "Jabloňová",
    "Kremnička", "Plánková", "Šípková", "Trnková",
  ],
  "Pršianska Terasa": [
    "Ametystová", "Bronzová", "Diamantová", "Jantárová", "Jaspisová",
    "Kremeňová", "Malachitová", "Medená", "Mosadzná", "Opálová",
    "Platinová", "Rubínová", "Rumelková", "Topásová", "Tyrkysová",
    "Zafírová", "Zlatá", "Železná",
  ],
  "Rakytovce": [
    "Borovicová", "Brestová", "Klenová", "Liesková", "Rakytovská cesta",
    "Smreková", "Vŕbová",
  ],
};

// Build reverse lookup: normalized street name → city part
const streetToCityPart = new Map<string, string>();

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

for (const [cityPart, streets] of Object.entries(CITY_PART_STREETS)) {
  for (const street of streets) {
    streetToCityPart.set(normalize(street), cityPart);
  }
}

/**
 * Look up the official city part for a street name.
 * Returns the city part name or null if not found.
 */
export function getCityPart(streetName: string): string | null {
  const norm = normalize(streetName);

  // Direct match
  const direct = streetToCityPart.get(norm);
  if (direct) return direct;

  // Try without common suffixes
  for (const suffix of [" ulica", " cesta", " namestie"]) {
    const stripped = norm.replace(new RegExp(suffix + "$"), "");
    const found = streetToCityPart.get(stripped);
    if (found) return found;
  }

  // Try partial match (street name contained in key or vice versa)
  for (const [key, part] of streetToCityPart) {
    if (key.includes(norm) || norm.includes(key)) {
      return part;
    }
  }

  return null;
}
