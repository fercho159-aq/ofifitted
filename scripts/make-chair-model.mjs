/**
 * Genera un GLB de prueba: una silla de oficina ejecutiva a escala real.
 *
 * Mismo principio que make-placeholder-model.mjs: geometría simple con cubos
 * escalados, pero lo suficientemente reconocible para demostrar el pipeline
 * completo (visor 3D, vistas predefinidas, AR, visualizador sobre foto).
 *
 *   node scripts/make-chair-model.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/models/silla-demo.glb");

/* ── Geometría base: cubo unitario con normales planas ──────────────── */

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

/* ── Piezas de la silla, en metros ──────────────────────────────────────
   Silla ejecutiva tipo Cartagena: ~0.48 m ancho, ~1.10 m alto total.
   Origen en el centro de la base, apoyado en Y = 0.                    */

const SEAT_W = 0.48;
const SEAT_D = 0.45;
const SEAT_T = 0.07;
const SEAT_Y = 0.47;

const BACK_W = 0.44;
const BACK_H = 0.58;
const BACK_T = 0.04;
const BACK_Z = -(SEAT_D / 2 - 0.02);

const COL_S = 0.05;
const COL_H = 0.20;

const BASE_R = 0.29;
const BASE_T = 0.035;
const BASE_W = 0.06;

const ARM_X = SEAT_W / 2 - 0.03;
const ARM_POST_H = 0.20;
const ARM_PAD_L = 0.26;

const CASTER = 0.035;

const PARTS = [
  // Asiento
  { name: "asiento", material: 0, scale: [SEAT_W, SEAT_T, SEAT_D], translation: [0, SEAT_Y, 0] },
  // Respaldo
  { name: "respaldo", material: 0, scale: [BACK_W, BACK_H, BACK_T], translation: [0, SEAT_Y + SEAT_T / 2 + BACK_H / 2 + 0.02, BACK_Z] },
  // Columna central
  { name: "columna", material: 1, scale: [COL_S, COL_H, COL_S], translation: [0, SEAT_Y - SEAT_T / 2 - COL_H / 2, 0] },
  // Base - brazo frontal-trasero
  { name: "base-1", material: 1, scale: [BASE_W, BASE_T, BASE_R * 2], translation: [0, BASE_T / 2, 0] },
  // Base - brazo izquierda-derecha
  { name: "base-2", material: 1, scale: [BASE_R * 2, BASE_T, BASE_W], translation: [0, BASE_T / 2, 0] },
  // 4 ruedas en los extremos de la base
  { name: "rueda-1", material: 1, scale: [CASTER, CASTER, CASTER], translation: [0, CASTER / 2, BASE_R] },
  { name: "rueda-2", material: 1, scale: [CASTER, CASTER, CASTER], translation: [0, CASTER / 2, -BASE_R] },
  { name: "rueda-3", material: 1, scale: [CASTER, CASTER, CASTER], translation: [BASE_R, CASTER / 2, 0] },
  { name: "rueda-4", material: 1, scale: [CASTER, CASTER, CASTER], translation: [-BASE_R, CASTER / 2, 0] },
  // Poste del descansabrazos izquierdo
  { name: "brazo-izq-poste", material: 1, scale: [0.03, ARM_POST_H, 0.03], translation: [-ARM_X, SEAT_Y + ARM_POST_H / 2, -0.04] },
  // Pad del descansabrazos izquierdo
  { name: "brazo-izq-pad", material: 0, scale: [0.045, 0.025, ARM_PAD_L], translation: [-ARM_X, SEAT_Y + ARM_POST_H + 0.012, -0.02] },
  // Poste del descansabrazos derecho
  { name: "brazo-der-poste", material: 1, scale: [0.03, ARM_POST_H, 0.03], translation: [ARM_X, SEAT_Y + ARM_POST_H / 2, -0.04] },
  // Pad del descansabrazos derecho
  { name: "brazo-der-pad", material: 0, scale: [0.045, 0.025, ARM_PAD_L], translation: [ARM_X, SEAT_Y + ARM_POST_H + 0.012, -0.02] },
];

const MATERIALS = [
  {
    name: "Tapiz negro",
    pbrMetallicRoughness: {
      baseColorFactor: [0.08, 0.08, 0.09, 1],
      metallicFactor: 0,
      roughnessFactor: 0.85,
    },
  },
  {
    name: "Cromo",
    pbrMetallicRoughness: {
      baseColorFactor: [0.7, 0.7, 0.72, 1],
      metallicFactor: 0.9,
      roughnessFactor: 0.2,
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

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < cube.positions.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], cube.positions[i + a]);
      max[a] = Math.max(max[a], cube.positions[i + a]);
    }
  }

  const json = {
    asset: { version: "2.0", generator: "Ofifitted chair placeholder" },
    scene: 0,
    scenes: [{ name: "Silla ejecutiva", nodes: PARTS.map((_, i) => i) }],
    nodes: PARTS.map((part) => ({
      name: part.name,
      mesh: part.material,
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
        componentType: 5123,
        count: cube.indices.length,
        type: "SCALAR",
      },
      {
        bufferView: 1,
        componentType: 5126,
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
    Buffer.alloc(pad4(jsonBuffer.length), 0x20),
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

const totalH = SEAT_Y + SEAT_T / 2 + BACK_H + 0.02;
console.log(`Escrito ${path.relative(ROOT, OUT)}  (${glb.length} bytes)`);
console.log(`Dimensiones: ${SEAT_W * 100} × ${SEAT_D * 100} × ${Math.round(totalH * 100)} cm`);
