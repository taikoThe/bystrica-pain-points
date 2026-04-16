import * as fs from "fs";
import * as path from "path";
import simplify from "@turf/simplify";
import { polygon, multiPolygon, feature, featureCollection } from "@turf/helpers";
import turfUnion from "@turf/union";

// ─── Neighborhood-to-district mapping ──────────────────────────────────────
// Based on official city data: banskabystrica.sk/volebne-obvody
// OSM relation names → district IDs

const NEIGHBORHOOD_DISTRICT: Record<string, number> = {
  // Obvod 1 — Center: "Banská Bystrica" admin_level=10 covers the centrum
  // Also includes Karlovo
  "Banská Bystrica": 1,
  "Karlovo": 1,

  // Obvod 2 — East: Majer, Senica, Šalková, Uhlisko
  "Majer": 2,
  "Senica": 2,
  "Šalková": 2,
  "Uhlisko": 2,

  // Obvod 3 — Sásová: Rudlová, Sásová
  "Rudlová": 3,
  "Sásová": 3,
  "Nová Sásová": 3,

  // Obvod 4 — North: Jakub, Kostiviarska, Podlavice, Skubín, Uľanka
  "Jakub": 4,
  "Kostiviarska": 4,
  "Podlavice": 4,
  "Skubín": 4,
  "Uľanka": 4,

  // Obvod 5 — Fončorda
  "Fončorda": 5,
  "Sídlisko": 5,

  // Obvod 6 — Radvaň
  "Radvaň": 6,

  // Obvod 7 — South: Iliaš, Kráľová, Kremnička, Pršianska Terasa, Rakytovce
  "Iliaš": 7,
  "Kráľová": 7,
  "Kremnička": 7,
  "Pršianska Terasa": 7,
  "Rakytovce": 7,
};

// ─── Types ─────────────────────────────────────────────────────────────────

interface OverpassNode {
  type: "node";
  id: number;
  lat: number;
  lon: number;
}

interface OverpassWay {
  type: "way";
  id: number;
  nodes: number[];
  tags?: Record<string, string>;
}

interface OverpassRelation {
  type: "relation";
  id: number;
  tags?: Record<string, string>;
  members: Array<{
    type: string;
    ref: number;
    role: string;
  }>;
}

type OverpassElement = OverpassNode | OverpassWay | OverpassRelation;

interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// ─── District properties (original data) ───────────────────────────────────

const DISTRICT_PROPERTIES: Record<number, Record<string, unknown>> = {
  1: {
    id: 1,
    name_sk: "Obvod 1 – Stred",
    description: "Banská Bystrica-centrum",
    councilors: 6,
    precincts: "1–11",
    councilor_names: ["Ivana Figuli", "Ing. Mgr. David Kapusta", "Ing. Mgr. Pavol Katreniak", "Ing. Miriam Lapuníková, MBA", "Ing. arch. Tomáš Sobota", "Ing. Branislav Bosák"],
    councilor_photos: ["ivana-figuli.jpg", "david-kapusta.jpg", "pavol-katreniak.jpg", "miriam-lapunikova.jpg", "tomas-sobota.jpg", "branislav-bosak.jpg"],
  },
  2: {
    id: 2,
    name_sk: "Obvod 2 – Východ",
    description: "Majer, Senica, Šalková, Uhlisko",
    councilors: 2,
    precincts: "12–17",
    councilor_names: ["PhDr. Marcel Pecník", "Ing. Ľuboš Vrbický"],
    councilor_photos: ["marcel-pecnik.jpg", "lubos-vrbicky.jpg"],
  },
  3: {
    id: 3,
    name_sk: "Obvod 3 – Sásová",
    description: "Rudlová, Sásová",
    councilors: 9,
    precincts: "18–39",
    councilor_names: ["Ing. Lukáš Berec", "Ing. Pavel Fiľo", "Mgr. Jakub Gajdošík", "Ing. Milan Lichý", "Marián Lunter", "Ing. Martin Majling", "Mgr. Matúš Molitoris", "Ing. Michal Škantár", "Ing. Martin Turčan"],
    councilor_photos: ["lukas-berec.jpg", "pavel-filo.jpg", "jakub-gajdosik.jpg", "milan-lichy.jpg", "marian-lunter.jpg", "martin-majling.jpg", "matus-molitoris.jpg", "michal-skantar.jpg", "martin-turcan.jpg"],
  },
  4: {
    id: 4,
    name_sk: "Obvod 4 – Sever",
    description: "Jakub, Kostiviarska, Podlavice, Skubín, Uľanka",
    councilors: 2,
    precincts: "40–45",
    councilor_names: ["MUDr. Jozef Baláž", "MUDr. Zuzana Podmanická"],
    councilor_photos: ["jozef-balaz.jpg", "zuzana-podmanicka.jpg"],
  },
  5: {
    id: 5,
    name_sk: "Obvod 5 – Fončorda",
    description: "Fončorda",
    councilors: 7,
    precincts: "46–62",
    councilor_names: ["Mgr. Diana Javorčíková", "Ing. Vladimír Ivan", "Ing. arch. Hana Kasová", "doc. PhDr. Branislav Kováčik, PhD.", "Mgr. Ružena Maťašeje", "Mgr. Marek Modranský", "Mgr. Peter Gogola"],
    councilor_photos: ["diana-javorcikova.jpg", "vladimir-ivan.jpg", "hana-kasova.jpg", "branislav-kovacik.jpg", "ruzena-mataseje.jpg", "marek-modransky.jpg", "peter-gogola.jpg"],
  },
  6: {
    id: 6,
    name_sk: "Obvod 6 – Radvaň",
    description: "Radvaň",
    councilors: 3,
    precincts: "63–70",
    councilor_names: ["Erika Karová", "Roman Miškár", "Mgr. Patrik Trnka"],
    councilor_photos: ["erika-karova.jpg", "roman-miskar.jpg", "patrik-trnka.jpg"],
  },
  7: {
    id: 7,
    name_sk: "Obvod 7 – Juh",
    description: "Iliaš, Kráľová, Kremnička, Pršianska Terasa, Rakytovce",
    councilors: 2,
    precincts: "71–77",
    councilor_names: ["Ing. Igor Kašper", "Milan Smädo"],
    councilor_photos: ["igor-kasper.jpg", "milan-smado.jpg"],
  },
};

// ─── Fetch boundary relations from Overpass ────────────────────────────────

async function fetchBoundaries(): Promise<{
  nodes: Map<number, [number, number]>;
  ways: Map<number, OverpassWay>;
  relations: OverpassRelation[];
}> {
  // Use bbox covering Banská Bystrica municipality
  const bbox = "48.65,19.05,48.82,19.25";
  const query = `
    [out:json][timeout:120];
    (
      relation["boundary"="administrative"]["admin_level"~"9|10|11"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `;

  const cachePath = path.resolve(__dirname, "overpass-cache.json");
  let elements: OverpassElement[];

  if (fs.existsSync(cachePath)) {
    console.log("Loading cached Overpass data...");
    const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    elements = cached.elements;
  } else {
    console.log("Fetching neighborhood boundaries from Overpass API...");
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(120000),
    });

    if (!resp.ok) {
      throw new Error(`Overpass API error: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();
    elements = data.elements as OverpassElement[];

    // Cache for subsequent runs
    fs.writeFileSync(cachePath, JSON.stringify(data), "utf-8");
    console.log(`  Cached to ${cachePath}`);
  }

  const nodes = new Map<number, [number, number]>();
  const ways = new Map<number, OverpassWay>();
  const relations: OverpassRelation[] = [];

  for (const el of elements) {
    if (el.type === "node") {
      const n = el as OverpassNode;
      nodes.set(n.id, [n.lon, n.lat]);
    } else if (el.type === "way") {
      ways.set(el.id, el as OverpassWay);
    } else if (el.type === "relation") {
      relations.push(el as OverpassRelation);
    }
  }

  console.log(`  Nodes: ${nodes.size}, Ways: ${ways.size}, Relations: ${relations.length}`);
  return { nodes, ways, relations };
}

// ─── Ring winding order ────────────────────────────────────────────────────

function ringArea(ring: number[][]): number {
  // Shoelace formula — positive = counter-clockwise, negative = clockwise
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return area / 2;
}

function ensureCCW(ring: number[][]): number[][] {
  if (ringArea(ring) < 0) return [...ring].reverse();
  return ring;
}

// ─── Assemble relation ways into polygon rings ─────────────────────────────

function assembleRings(
  relation: OverpassRelation,
  ways: Map<number, OverpassWay>,
  nodes: Map<number, [number, number]>,
): number[][][] {
  // Collect outer and inner way members
  const outerWayIds: number[] = [];
  const innerWayIds: number[] = [];

  for (const member of relation.members) {
    if (member.type !== "way") continue;
    if (member.role === "inner") {
      innerWayIds.push(member.ref);
    } else {
      // "outer" or "" (default role)
      outerWayIds.push(member.ref);
    }
  }

  function resolveWayCoords(wayId: number): [number, number][] {
    const way = ways.get(wayId);
    if (!way) return [];
    return way.nodes
      .map((nid) => nodes.get(nid))
      .filter((c): c is [number, number] => c !== undefined);
  }

  function joinWays(wayIds: number[]): number[][][] {
    if (wayIds.length === 0) return [];

    // Get all way segments
    const segments: [number, number][][] = wayIds
      .map((id) => resolveWayCoords(id))
      .filter((s) => s.length > 0);

    if (segments.length === 0) return [];

    // Join segments into rings
    const rings: number[][][] = [];
    const used = new Set<number>();

    while (used.size < segments.length) {
      // Find first unused segment
      let startIdx = -1;
      for (let i = 0; i < segments.length; i++) {
        if (!used.has(i)) {
          startIdx = i;
          break;
        }
      }
      if (startIdx === -1) break;

      const ring: [number, number][] = [...segments[startIdx]];
      used.add(startIdx);

      // Try to extend the ring by joining adjacent segments
      let changed = true;
      while (changed) {
        changed = false;
        const last = ring[ring.length - 1];
        const first = ring[0];

        // Check if ring is closed
        if (
          ring.length > 2 &&
          Math.abs(last[0] - first[0]) < 1e-7 &&
          Math.abs(last[1] - first[1]) < 1e-7
        ) {
          break;
        }

        for (let i = 0; i < segments.length; i++) {
          if (used.has(i)) continue;
          const seg = segments[i];
          const segFirst = seg[0];
          const segLast = seg[seg.length - 1];

          // Check if segment connects to end of ring
          if (
            Math.abs(last[0] - segFirst[0]) < 1e-7 &&
            Math.abs(last[1] - segFirst[1]) < 1e-7
          ) {
            ring.push(...seg.slice(1));
            used.add(i);
            changed = true;
            break;
          }
          // Check reversed
          if (
            Math.abs(last[0] - segLast[0]) < 1e-7 &&
            Math.abs(last[1] - segLast[1]) < 1e-7
          ) {
            ring.push(...[...seg].reverse().slice(1));
            used.add(i);
            changed = true;
            break;
          }
        }
      }

      // Close ring if not already closed
      if (
        ring.length > 2 &&
        (Math.abs(ring[0][0] - ring[ring.length - 1][0]) > 1e-7 ||
          Math.abs(ring[0][1] - ring[ring.length - 1][1]) > 1e-7)
      ) {
        ring.push([...ring[0]]);
      }

      if (ring.length >= 4) {
        // Ensure counter-clockwise winding for outer rings (GeoJSON spec)
        rings.push(ensureCCW(ring.map((c) => [c[0], c[1]])));
      }
    }

    return rings;
  }

  const outerRings = joinWays(outerWayIds);
  const innerRings = joinWays(innerWayIds);

  // Return outer rings first, then inner rings (inner reversed to CW)
  const result = [...outerRings];
  for (const ir of innerRings) {
    // Inner rings must be clockwise
    const area = ringArea(ir);
    result.push(area > 0 ? [...ir].reverse() : ir);
  }
  return result;
}

// ─── Union multiple polygons ───────────────────────────────────────────────

function unionPolygons(
  polygons: Array<{ type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] }>,
): { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } | null {
  if (polygons.length === 0) return null;
  if (polygons.length === 1) return polygons[0];

  // Build turf features
  const features = polygons.map((p) =>
    p.type === "MultiPolygon"
      ? multiPolygon(p.coordinates as number[][][][])
      : polygon(p.coordinates as number[][][]),
  );

  try {
    // Turf v7: union takes a FeatureCollection
    const fc = featureCollection(features as any);
    const united = turfUnion(fc as any);
    if (united) {
      return united.geometry as any;
    }
  } catch (e: any) {
    console.warn(`  Warning: union failed: ${e.message}`);
    // Fallback: return as MultiPolygon with all rings
    const allCoords: number[][][][] = [];
    for (const p of polygons) {
      if (p.type === "MultiPolygon") {
        allCoords.push(...(p.coordinates as number[][][][]));
      } else {
        allCoords.push(p.coordinates as number[][][]);
      }
    }
    return { type: "MultiPolygon", coordinates: allCoords };
  }

  return polygons[0];
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== District Polygon Generator (Boundary-based) ===\n");

  console.log(`District properties loaded for 7 districts\n`);

  // Fetch boundaries
  const { nodes, ways, relations } = await fetchBoundaries();

  // Deduplicate relations: prefer admin_level=10 for neighborhoods,
  // use admin_level=9 for outer areas, admin_level=11 for sub-neighborhoods
  // Build map: name → best relation
  const nameToRelation = new Map<string, OverpassRelation>();

  // Sort relations: prefer 10, then 11, then 9
  const sortedRelations = [...relations].sort((a, b) => {
    const aLevel = parseInt(a.tags?.admin_level || "99");
    const bLevel = parseInt(b.tags?.admin_level || "99");
    // Prefer 10, then 9, then 11
    const priority: Record<number, number> = { 10: 0, 9: 1, 11: 2 };
    return (priority[aLevel] ?? 3) - (priority[bLevel] ?? 3);
  });

  for (const rel of sortedRelations) {
    const name = rel.tags?.name;
    if (!name) continue;
    if (!nameToRelation.has(name)) {
      nameToRelation.set(name, rel);
    }
  }

  console.log(`\nAvailable boundary relations:`);
  for (const [name, rel] of nameToRelation) {
    const district = NEIGHBORHOOD_DISTRICT[name];
    console.log(
      `  ${name} (level ${rel.tags?.admin_level}, ${rel.members.length} members)` +
        (district ? ` → Obvod ${district}` : " (not assigned)"),
    );
  }

  // For each neighborhood that doesn't have a relation, check if it exists
  // as a place node (for Pršianska Terasa)
  console.log();

  // Build district polygons by merging neighborhood boundaries
  const districtPolygons = new Map<
    number,
    Array<{ type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] }>
  >();

  for (const [neighborhoodName, districtId] of Object.entries(NEIGHBORHOOD_DISTRICT)) {
    const rel = nameToRelation.get(neighborhoodName);
    if (!rel) {
      console.log(`  WARNING: No boundary relation found for "${neighborhoodName}" (Obvod ${districtId})`);
      continue;
    }

    const rings = assembleRings(rel, ways, nodes);
    if (rings.length === 0) {
      console.log(`  WARNING: Could not assemble rings for "${neighborhoodName}"`);
      continue;
    }

    console.log(
      `  ${neighborhoodName} → Obvod ${districtId}: ${rings.length} ring(s), ` +
        `${rings.reduce((s, r) => s + r.length, 0)} total vertices`,
    );

    const geom: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } = {
      type: "Polygon",
      coordinates: rings,
    };

    if (!districtPolygons.has(districtId)) {
      districtPolygons.set(districtId, []);
    }
    districtPolygons.get(districtId)!.push(geom);
  }

  console.log("\n--- Generating district polygons ---\n");

  const features: GeoJSONFeature[] = [];

  for (let id = 1; id <= 7; id++) {
    const polys = districtPolygons.get(id);
    const properties = DISTRICT_PROPERTIES[id];

    if (!polys || polys.length === 0) {
      console.log(`Obvod ${id}: No polygon data, keeping existing`);
      continue;
    }

    console.log(`Obvod ${id}: Merging ${polys.length} neighborhood polygon(s)...`);

    let geometry: GeoJSONFeature["geometry"];

    if (polys.length === 1) {
      geometry = polys[0] as GeoJSONFeature["geometry"];
    } else {
      const united = unionPolygons(polys);
      if (united) {
        geometry = united as GeoJSONFeature["geometry"];
      } else {
        console.log(`  WARNING: Union failed, using first polygon`);
        geometry = polys[0] as GeoJSONFeature["geometry"];
      }
    }

    // Simplify to reduce vertex count while keeping shape
    const turfFeature =
      geometry.type === "MultiPolygon"
        ? multiPolygon(geometry.coordinates as number[][][][])
        : polygon(geometry.coordinates as number[][][]);

    const simplified = simplify(turfFeature, {
      tolerance: 0.0001,
      highQuality: true,
    });

    geometry = simplified.geometry as GeoJSONFeature["geometry"];

    // Count vertices
    let vertexCount = 0;
    if (geometry.type === "Polygon") {
      vertexCount = (geometry.coordinates as number[][][]).reduce(
        (s, r) => s + r.length,
        0,
      );
    } else {
      vertexCount = (geometry.coordinates as number[][][][]).reduce(
        (s, p) => s + p.reduce((s2, r) => s2 + r.length, 0),
        0,
      );
    }

    console.log(
      `  Result: ${geometry.type} with ${vertexCount} vertices`,
    );

    features.push({
      type: "Feature",
      properties,
      geometry,
    });
  }

  // Write output
  const output: GeoJSONCollection = {
    type: "FeatureCollection",
    features,
  };

  const outPath = path.resolve(__dirname, "../public/districts.geojson");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`\n=== Summary ===`);
  console.log(`Districts generated: ${features.length}/7`);
  console.log(`Output written to: ${outPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
