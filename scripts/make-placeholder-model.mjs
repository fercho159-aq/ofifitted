/**
 * Genera un GLB de prueba: un escritorio simple a escala real.
 *
 * No sustituye a los modelos de fábrica. Existe para validar el pipeline
 * completo —visor, escala, orientación, origen en el piso y AR— antes de que
 * lleguen los GLB reales, y para que el visor se pueda revisar en cualquier
 * momento sin depender de una entrega externa.
 *
 * Cumple el mismo presupuesto técnico que le pedimos al cliente:
 *   · unidades en metros            · origen en el centro de la base
 *   · +Y arriba, frente hacia +Z    · glTF 2.0 binario
 *
 *   node scripts/make-placeholder-model.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/models/escritorio-demo.glb");

/* ── Geometría base: un cubo unitario centrado en el origen ─────────────
   Cada cara lleva sus propios vértices para que las normales salgan planas
   y el mueble no se vea "inflado". 24 vértices, 36 índices.            */

const FACES = [
  { n: [0, 0, 1], v: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
  { n: [0, 0, -1], v: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
  { n: [1, 0, 0], v: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
  { n: [-1, 0, 0], v: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
  { n: [0, 1, 0], v: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
  { n: [0, -1, 0], v: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
];

function unitCube() {
  const positions = [];
  const normals = [];
  const indices = [];

  FACES.forEach((face, f) => {
    for (const vertex of face.v) {
      positions.push(...vertex);
      normals.push(...face.n);
    }
    const o = f * 4;
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });

  return { positions, normals, indices };
}

/* ── Piezas del escritorio, en metros ───────────────────────────────────
   Medidas de un escritorio ejecutivo típico: 1.60 × 0.70 × 0.75 m.
   `y` es el centro vertical de cada pieza; la base queda en y = 0.      */

const W = 1.6;
const D = 0.7;
const H = 0.75;
const TOP_T = 0.04; // grosor de la cubierta
const LEG = 0.06;

const PARTS = [
  // Cubierta
  { name: "cubierta", material: 0, scale: [W, TOP_T, D], translation: [0, H - TOP_T / 2, 0] },
  // Cuatro patas
  ...[
    [-(W / 2 - LEG), -(D / 2 - LEG)],
    [W / 2 - LEG, -(D / 2 - LEG)],
    [-(W / 2 - LEG), D / 2 - LEG],
    [W / 2 - LEG, D / 2 - LEG],
  ].map(([x, z], i) => ({
    name: `pata-${i + 1}`,
    material: 1,
    scale: [LEG, H - TOP_T, LEG],
    translation: [x, (H - TOP_T) / 2, z],
  })),
  // Faldón trasero
  {
    name: "faldon",
    material: 1,
    scale: [W - LEG * 4, 0.28, 0.02],
    translation: [0, H - TOP_T - 0.2, -(D / 2 - 0.06)],
  },
];

const MATERIALS = [
  {
    name: "Cubierta melamina nogal",
    pbrMetallicRoughness: {
      baseColorFactor: [0.42, 0.29, 0.19, 1],
      metallicFactor: 0,
      roughnessFactor: 0.65,
    },
  },
  {
    name: "Estructura metálica",
    pbrMetallicRoughness: {
      baseColorFactor: [0.13, 0.13, 0.14, 1],
      metallicFactor: 0.8,
      roughnessFactor: 0.35,
    },
  },
];

/* ── Ensamblado del GLB ─────────────────────────────────────────────── */

function pad4(n) {
  return (4 - (n % 4)) % 4;
}

function build() {
  const cube = unitCube();

  const indexArray = new Uint16Array(cube.indices);
  const positionArray = new Float32Array(cube.positions);
  const normalArray = new Float32Array(cube.normals);

  // El buffer binario: índices, posiciones y normales, cada bloque alineado a 4.
  const chunks = [
    Buffer.from(indexArray.buffer),
    Buffer.from(positionArray.buffer),
    Buffer.from(normalArray.buffer),
  ];

  const offsets = [];
  let cursor = 0;
  const aligned = [];
  for (const chunk of chunks) {
    offsets.push(cursor);
    aligned.push(chunk);
    cursor += chunk.length;
    const padding = pad4(cursor);
    if (padding) {
      aligned.push(Buffer.alloc(padding));
      cursor += padding;
    }
  }
  const bin = Buffer.concat(aligned);

  // Límites de las posiciones: glTF los exige en el accessor de POSITION.
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < cube.positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], cube.positions[i + a]);
      max[a] = Math.max(max[a], cube.positions[i + a]);
    }
  }

  const json = {
    asset: { version: "2.0", generator: "Ofifitted placeholder generator" },
    scene: 0,
    scenes: [{ name: "Escritorio", nodes: PARTS.map((_, i) => i) }],
    nodes: PARTS.map((part) => ({
      name: part.name,
      mesh: part.material, // una malla por material
      scale: part.scale,
      translation: part.translation,
    })),
    meshes: MATERIALS.map((m, i) => ({
      name: m.name,
      primitives: [
        {
          attributes: { POSITION: 1, NORMAL: 2 },
          indices: 0,
          material: i,
        },
      ],
    })),
    materials: MATERIALS,
    accessors: [
      {
        bufferView: 0,
        componentType: 5123, // UNSIGNED_SHORT
        count: cube.indices.length,
        type: "SCALAR",
      },
      {
        bufferView: 1,
        componentType: 5126, // FLOAT
        count: cube.positions.length / 3,
        type: "VEC3",
        min,
        max,
      },
      {
        bufferView: 2,
        componentType: 5126,
        count: cube.normals.length / 3,
        type: "VEC3",
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: offsets[0], byteLength: chunks[0].length, target: 34963 },
      { buffer: 0, byteOffset: offsets[1], byteLength: chunks[1].length, target: 34962 },
      { buffer: 0, byteOffset: offsets[2], byteLength: chunks[2].length, target: 34962 },
    ],
    buffers: [{ byteLength: bin.length }],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPadded = Buffer.concat([
    jsonBuffer,
    Buffer.alloc(pad4(jsonBuffer.length), 0x20), // relleno con espacios
  ]);

  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + bin.length, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonHeader.write("JSON", 4, "ascii");

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(bin.length, 0);
  binHeader.write("BIN\0", 4, "ascii");

  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, bin]);
}

const glb = build();
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, glb);

console.log(`Escrito ${path.relative(ROOT, OUT)}  (${glb.length} bytes)`);
console.log(`Dimensiones: ${W * 100} × ${D * 100} × ${H * 100} cm`);
