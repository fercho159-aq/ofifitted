/**
 * Genera el modelo 3D de la SILLA CARTAGENA ALTO a partir de su foto.
 *
 * No es un modelo de fábrica: es la silla modelada en código, pieza por pieza,
 * siguiendo la foto del catálogo (respaldo alto de vinipiel en franjas, rieles
 * laterales cromados, descansabrazos, pistón y base de 5 patas con ruedas
 * dobles). Sirve mientras Ofifitted no entregue el modelo real.
 *
 * Usa las geometrías de `three`, que ya instala @google/model-viewer, y escribe
 * el GLB a mano. Cumple la especificación del proyecto (HANDOFF.md):
 * metros reales, +Y arriba, frente hacia +Z, origen en el centro de la base
 * apoyado en Y = 0.
 *
 *   node scripts/make-chair-model.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/models/silla-cartagena-alto.glb");

const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ── Utilidades de geometría ────────────────────────────────────────── */

/** Deja solo posición y normal: lo único que exporta el GLB. */
function clean(g) {
  for (const name of Object.keys(g.attributes)) {
    if (name !== "position" && name !== "normal") g.deleteAttribute(name);
  }
  g.clearGroups();
  return g;
}

function geometry(positions, indices, normals = null) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  if (normals) g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  else g.computeVertexNormals();
  return g;
}

/**
 * Rectángulo redondeado en el plano de la sección: `x` a lo ancho y `y` a lo
 * grueso, de `bottom` a `top`. Siempre devuelve el mismo número de puntos,
 * para poder unir secciones de distinto tamaño.
 */
function roundedRect(w, bottom, top, r, cornerSeg = 5, edgeSeg = 8) {
  const h = top - bottom;
  r = Math.max(1e-5, Math.min(r, h / 2 - 1e-6, w / 2 - 1e-6));
  const cx = w / 2 - r;
  const yTop = top - r;
  const yBot = bottom + r;
  const pts = [];

  const arc = (ox, oy, a0) => {
    for (let i = 0; i <= cornerSeg; i++) {
      const a = a0 + (i / cornerSeg) * (Math.PI / 2);
      pts.push([ox + r * Math.cos(a), oy + r * Math.sin(a)]);
    }
  };
  const line = (x0, y0, x1, y1, n) => {
    for (let i = 1; i < n; i++) {
      const k = i / n;
      pts.push([x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]);
    }
  };

  arc(cx, yBot, -Math.PI / 2);
  line(w / 2, yBot, w / 2, yTop, 2);
  arc(cx, yTop, 0);
  line(cx, top, -cx, top, edgeSeg);
  arc(-cx, yTop, Math.PI / 2);
  line(-w / 2, yTop, -w / 2, yBot, 2);
  arc(-cx, yBot, Math.PI);
  line(-cx, bottom, cx, bottom, edgeSeg);
  return pts;
}

function triangleNormal(pos, a, b, c) {
  const pa = V(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]);
  const pb = V(pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
  const pc = V(pos[c * 3], pos[c * 3 + 1], pos[c * 3 + 2]);
  return pb.sub(pa).cross(pc.sub(pa));
}

function flipTriangles(indices) {
  for (let i = 0; i < indices.length; i += 3) {
    [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  }
}

/**
 * Barre una sección a lo largo de una serie de marcos {p, t, n, b}.
 * `sectionAt(i, count)` devuelve los puntos [b, n] de la sección i.
 * La orientación de las caras se corrige sola para que apunten hacia fuera.
 */
function loft(frames, sectionAt, { caps = true } = {}) {
  const rings = frames.map((f, i) =>
    sectionAt(i, frames.length).map(([a, b]) =>
      f.p.clone().addScaledVector(f.b, a).addScaledVector(f.n, b)
    )
  );
  const m = rings[0].length;

  const pos = [];
  for (const ring of rings) for (const v of ring) pos.push(v.x, v.y, v.z);

  const idx = [];
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < m; j++) {
      const j2 = (j + 1) % m;
      const a = i * m + j;
      const b = i * m + j2;
      const c = (i + 1) * m + j;
      const d = (i + 1) * m + j2;
      idx.push(a, b, c, b, d, c);
    }
  }

  // Orientación: las caras del anillo central deben mirar lejos de su centro.
  const k = Math.min(Math.floor(rings.length / 2), rings.length - 2);
  const center = rings[k].reduce((acc, v) => acc.add(v), V(0, 0, 0)).divideScalar(m);
  let score = 0;
  for (let j = 0; j < m; j++) {
    const t = (k * m + j) * 6;
    const n = triangleNormal(pos, idx[t], idx[t + 1], idx[t + 2]);
    score += n.dot(rings[k][j].clone().sub(center));
  }
  if (score < 0) flipTriangles(idx);

  const parts = [geometry(pos, idx)];

  if (caps) {
    for (const [ring, frame, sign] of [
      [rings[0], frames[0], -1],
      [rings.at(-1), frames.at(-1), 1],
    ]) {
      const c = ring.reduce((acc, v) => acc.add(v), V(0, 0, 0)).divideScalar(m);
      const out = frame.t.clone().multiplyScalar(sign);
      const cp = [c.x, c.y, c.z];
      const cn = [out.x, out.y, out.z];
      for (const v of ring) {
        cp.push(v.x, v.y, v.z);
        cn.push(out.x, out.y, out.z);
      }
      const ci = [];
      for (let j = 0; j < m; j++) ci.push(0, 1 + j, 1 + ((j + 1) % m));
      if (triangleNormal(cp, ci[0], ci[1], ci[2]).dot(out) < 0) flipTriangles(ci);
      parts.push(geometry(cp, ci, cn));
    }
  }

  return mergeGeometries(parts);
}

/** Marcos a lo largo de una curva contenida en el plano YZ (perfil lateral). */
function profileFrames(curve, segments) {
  const frames = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const t = curve.getTangentAt(u);
    frames.push({
      p: curve.getPointAt(u),
      t,
      b: V(1, 0, 0),
      // Hacia el lado donde uno se sienta: al frente en el respaldo, arriba en el asiento.
      n: V(0, t.z, -t.y).normalize(),
    });
  }
  return frames;
}

/** Marcos a lo largo de un segmento recto, con `n` lo más cerca posible de +Y. */
function lineFrames(p0, p1, segments) {
  const t = p1.clone().sub(p0).normalize();
  const b = t.clone().cross(V(0, 1, 0)).normalize();
  const n = b.clone().cross(t).normalize();
  const frames = [];
  for (let i = 0; i <= segments; i++) {
    frames.push({ p: p0.clone().lerp(p1, i / segments), t, b, n });
  }
  return frames;
}

function cylinderBetween(p0, p1, r0, r1 = r0, radial = 24) {
  const dir = p1.clone().sub(p0);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, radial, 1, false);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.normalize()));
  g.translate(p0.x, p0.y, p0.z);
  return clean(g);
}

function sphereAt(p, r) {
  const g = new THREE.SphereGeometry(r, 20, 12);
  g.translate(p.x, p.y, p.z);
  return clean(g);
}

function tube(points, radius, segments = 80) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  return clean(new THREE.TubeGeometry(curve, segments, radius, 14, false));
}

/* ── La silla ───────────────────────────────────────────────────────── */

const leather = [];
const chrome = [];
const plastic = [];

/* Perfil lateral del respaldo y el asiento: una sola pieza continua, como la
   silla real. Va de la parte alta del respaldo al borde frontal del asiento. */
const PROFILE = new THREE.CatmullRomCurve3(
  [
    V(0, 1.085, -0.285),
    V(0, 0.9, -0.255),
    V(0, 0.7, -0.215),
    V(0, 0.565, -0.18),
    V(0, 0.495, -0.12),
    V(0, 0.472, -0.02),
    V(0, 0.476, 0.12),
    V(0, 0.498, 0.24),
  ],
  false,
  "centripetal"
);
const PROFILE_LEN = PROFILE.getLength();
const PROFILE_SEG = 380;
const frames = profileFrames(PROFILE, PROFILE_SEG);

const SLING_W = 0.44;
const RAIL_X = 0.232;

// Tapiz acolchado en franjas horizontales, con un dobladillo liso en cada punta.
const HEM = 0.025;
const RIBS = Math.round((PROFILE_LEN - 2 * HEM) / 0.066);
const PITCH = (PROFILE_LEN - 2 * HEM) / RIBS;

function padding(s) {
  if (s < HEM || s > PROFILE_LEN - HEM) return 0.25;
  const phase = ((s - HEM) % PITCH) / PITCH;
  return Math.pow(Math.sin(Math.PI * phase), 0.55);
}

leather.push(
  loft(frames, (i, count) => {
    const s = (i / (count - 1)) * PROFILE_LEN;
    return roundedRect(SLING_W, -0.006, 0.005 + 0.011 * padding(s), 0.005, 5, 14);
  })
);

// Rieles laterales cromados que siguen el perfil, con sus remates redondos.
for (const side of [-1, 1]) {
  const section = roundedRect(0.02, -0.03, 0.006, 0.006, 4, 2).map(([a, b]) => [
    a + side * RAIL_X,
    b,
  ]);
  chrome.push(loft(frames, () => section));

  for (const f of [frames[0], frames.at(-1)]) {
    const c = f.p.clone().addScaledVector(f.n, -0.012);
    chrome.push(
      cylinderBetween(
        V(side * (RAIL_X - 0.012), c.y, c.z),
        V(side * (RAIL_X + 0.014), c.y, c.z),
        0.017
      )
    );
  }
}

// Travesaños bajo el asiento y detrás del respaldo.
function frameNearZ(z, seat = true) {
  return frames
    .filter((f) => (seat ? f.p.y < 0.52 : f.p.y > 0.6))
    .reduce((best, f) => (Math.abs(f.p.z - z) < Math.abs(best.p.z - z) ? f : best));
}
function frameNearY(y) {
  return frames.reduce((best, f) => (Math.abs(f.p.y - y) < Math.abs(best.p.y - y) ? f : best));
}
for (const f of [frameNearZ(0.0), frameNearZ(0.17), frameNearY(0.86)]) {
  const c = f.p.clone().addScaledVector(f.n, -0.022);
  chrome.push(cylinderBetween(V(-RAIL_X, c.y, c.z), V(RAIL_X, c.y, c.z), 0.009));
}

// Descansabrazos: soporte cromado en forma de lazo y cojín negro encima.
for (const side of [-1, 1]) {
  const x = side * 0.262;
  const back = frameNearY(0.69);
  const backP = back.p.clone().addScaledVector(back.n, -0.012);
  const seat = frameNearZ(0.04);
  const seatP = seat.p.clone().addScaledVector(seat.n, -0.012);

  chrome.push(
    tube(
      [
        V(side * RAIL_X, backP.y, backP.z),
        V(x, 0.695, -0.17),
        V(x, 0.7, 0.02),
        V(x, 0.694, 0.1),
        V(x, 0.66, 0.145),
        V(x, 0.58, 0.137),
        V(side * 0.255, 0.52, 0.09),
        V(side * RAIL_X, seatP.y, seatP.z),
      ],
      0.0085,
      96
    )
  );

  leather.push(
    loft(lineFrames(V(x, 0.716, -0.195), V(x, 0.716, 0.115), 24), (i, count) => {
      const u = i / (count - 1);
      const e = Math.min(u, 1 - u) / 0.12;
      const k = e >= 1 ? 1 : 0.6 + 0.4 * Math.sqrt(1 - (1 - e) ** 2);
      return roundedRect(0.048 * k, -0.012 * k, 0.013 * k, 0.011 * k, 5, 4);
    })
  );
}

// Mecanismo, palanca y pistón.
plastic.push(clean(new THREE.BoxGeometry(0.18, 0.04, 0.19).translate(0, 0.418, 0.01)));
plastic.push(tube([V(0.07, 0.41, 0.03), V(0.13, 0.4, 0.055), V(0.19, 0.385, 0.08)], 0.005, 16));
plastic.push(sphereAt(V(0.19, 0.385, 0.08), 0.011));

chrome.push(cylinderBetween(V(0, 0.095, 0), V(0, 0.25, 0), 0.03));
chrome.push(cylinderBetween(V(0, 0.25, 0), V(0, 0.4, 0), 0.021));
plastic.push(cylinderBetween(V(0, 0.235, 0), V(0, 0.255, 0), 0.032));

// Base de 5 patas cromadas con rodajas dobles.
chrome.push(cylinderBetween(V(0, 0.085, 0), V(0, 0.135, 0), 0.048, 0.042));

for (let k = 0; k < 5; k++) {
  const angle = (k * 2 * Math.PI) / 5;
  const dir = V(Math.sin(angle), 0, Math.cos(angle));
  const axis = V(Math.cos(angle), 0, -Math.sin(angle));

  const p0 = dir.clone().multiplyScalar(0.03).setY(0.118);
  const p1 = dir.clone().multiplyScalar(0.295).setY(0.078);

  chrome.push(
    loft(lineFrames(p0, p1, 12), (i, count) => {
      const u = i / (count - 1);
      const lerp = (a, b) => a + (b - a) * u;
      return roundedRect(lerp(0.05, 0.03), -lerp(0.014, 0.009), lerp(0.018, 0.011), 0.009, 5, 4);
    })
  );

  const tip = dir.clone().multiplyScalar(0.3);
  chrome.push(cylinderBetween(V(tip.x, 0.058, tip.z), V(tip.x, 0.082, tip.z), 0.013));

  const c = dir.clone().multiplyScalar(0.305).setY(0.025);
  for (const s of [-1, 1]) {
    plastic.push(
      cylinderBetween(
        c.clone().addScaledVector(axis, s * 0.004),
        c.clone().addScaledVector(axis, s * 0.018),
        0.025
      )
    );
  }
  plastic.push(
    clean(
      new THREE.BoxGeometry(0.036, 0.022, 0.042)
        .rotateY(angle)
        .translate(c.x, 0.05, c.z)
    )
  );
}

/* ── Materiales ─────────────────────────────────────────────────────── */

const MATERIALS = [
  {
    name: "Vinipiel negra",
    parts: leather,
    pbrMetallicRoughness: {
      baseColorFactor: [0.035, 0.035, 0.038, 1],
      metallicFactor: 0,
      roughnessFactor: 0.5,
    },
  },
  {
    name: "Cromo",
    parts: chrome,
    pbrMetallicRoughness: {
      baseColorFactor: [0.92, 0.92, 0.94, 1],
      metallicFactor: 1,
      roughnessFactor: 0.15,
    },
  },
  {
    name: "Plástico negro",
    parts: plastic,
    pbrMetallicRoughness: {
      baseColorFactor: [0.02, 0.02, 0.022, 1],
      metallicFactor: 0,
      roughnessFactor: 0.38,
    },
  },
];

/* ── Ensamblado del GLB ─────────────────────────────────────────────── */

function pad4(n) {
  return (4 - (n % 4)) % 4;
}

function build() {
  const chunks = [];
  const bufferViews = [];
  const accessors = [];
  let cursor = 0;

  const addView = (typed, target) => {
    const buf = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
    bufferViews.push({ buffer: 0, byteOffset: cursor, byteLength: buf.length, target });
    chunks.push(buf);
    cursor += buf.length;
    const padding = pad4(cursor);
    if (padding) {
      chunks.push(Buffer.alloc(padding));
      cursor += padding;
    }
    return bufferViews.length - 1;
  };

  const meshes = [];
  const bounds = new THREE.Box3();
  let triangles = 0;

  MATERIALS.forEach((material, m) => {
    const merged = mergeGeometries(material.parts);
    merged.computeBoundingBox();
    bounds.union(merged.boundingBox);

    const positions = merged.getAttribute("position").array;
    const normals = merged.getAttribute("normal").array;
    const vertexCount = positions.length / 3;
    const indices =
      vertexCount > 65535
        ? new Uint32Array(merged.index.array)
        : new Uint16Array(merged.index.array);
    triangles += indices.length / 3;

    const { min, max } = merged.boundingBox;

    accessors.push({
      bufferView: addView(indices, 34963),
      componentType: indices instanceof Uint32Array ? 5125 : 5123,
      count: indices.length,
      type: "SCALAR",
    });
    const indexAccessor = accessors.length - 1;

    accessors.push({
      bufferView: addView(new Float32Array(positions), 34962),
      componentType: 5126,
      count: vertexCount,
      type: "VEC3",
      min: min.toArray(),
      max: max.toArray(),
    });
    const positionAccessor = accessors.length - 1;

    accessors.push({
      bufferView: addView(new Float32Array(normals), 34962),
      componentType: 5126,
      count: vertexCount,
      type: "VEC3",
    });
    const normalAccessor = accessors.length - 1;

    meshes.push({
      name: material.name,
      primitives: [
        {
          attributes: { POSITION: positionAccessor, NORMAL: normalAccessor },
          indices: indexAccessor,
          material: m,
        },
      ],
    });
  });

  const bin = Buffer.concat(chunks);

  const json = {
    asset: { version: "2.0", generator: "Ofifitted · scripts/make-chair-model.mjs" },
    scene: 0,
    scenes: [{ name: "Silla Cartagena Alto", nodes: meshes.map((_, i) => i) }],
    nodes: meshes.map((mesh, i) => ({ name: mesh.name, mesh: i })),
    meshes,
    materials: MATERIALS.map(({ name, pbrMetallicRoughness }) => ({
      name,
      pbrMetallicRoughness,
    })),
    accessors,
    bufferViews,
    buffers: [{ byteLength: bin.length }],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const jsonPadded = Buffer.concat([jsonBuffer, Buffer.alloc(pad4(jsonBuffer.length), 0x20)]);

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

  return {
    glb: Buffer.concat([header, jsonHeader, jsonPadded, binHeader, bin]),
    bounds,
    triangles,
  };
}

const { glb, bounds, triangles } = build();
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, glb);

const size = bounds.getSize(V(0, 0, 0));
const cm = (v) => Math.round(v * 100);
console.log(`Escrito ${path.relative(ROOT, OUT)}  (${(glb.length / 1024).toFixed(0)} KB)`);
console.log(`Triángulos: ${triangles.toLocaleString("es-MX")}`);
console.log(`Medidas: ${cm(size.x)} × ${cm(size.z)} × ${cm(size.y)} cm (ancho × fondo × alto)`);
console.log(`Apoyo en Y = ${bounds.min.y.toFixed(4)} m`);
