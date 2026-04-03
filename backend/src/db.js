const fs = require('fs');
const path = require('path');
const { dbPath, adminEmail, adminPassword } = require('./config');
const { hashPassword } = require('./utils/security');

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function createDefaultState() {
  return {
    users: [],
    materials: [],
    counters: {
      userId: 0,
      materialId: 0
    }
  };
}

function loadState() {
  if (!fs.existsSync(dbPath)) {
    const initial = createDefaultState();
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      counters: parsed.counters || { userId: 0, materialId: 0 }
    };
  } catch (error) {
    const fallback = createDefaultState();
    fs.writeFileSync(dbPath, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveState(state) {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2), 'utf8');
}

let state = loadState();

function nowIso() {
  return new Date().toISOString();
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function ensureAdminUser() {
  const email = String(adminEmail || '').toLowerCase().trim();
  if (!email) {
    return;
  }

  const existing = state.users.find((u) => u.email === email);
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  state.counters.userId += 1;
  state.users.push({
    id: state.counters.userId,
    fullName: 'System Admin',
    email,
    passwordHash,
    role: 'admin',
    createdAt: nowIso()
  });

  saveState(state);
  console.log(`Admin user created: ${email}`);
}

function findUserByEmail(email) {
  const needle = String(email || '').toLowerCase().trim();
  return state.users.find((u) => u.email === needle) || null;
}

function findUserById(id) {
  const numId = Number(id);
  return state.users.find((u) => u.id === numId) || null;
}

function createUser({ fullName, email, passwordHash, role = 'student' }) {
  state.counters.userId += 1;
  const user = {
    id: state.counters.userId,
    fullName: String(fullName).trim(),
    email: String(email).toLowerCase().trim(),
    passwordHash,
    role,
    createdAt: nowIso()
  };
  state.users.push(user);
  saveState(state);
  return user;
}

function listMaterials(filters = {}) {
  const {
    q = '',
    branch = '',
    semester = '',
    subject = '',
    type = '',
    sort = 'created_desc',
    page = 1,
    limit = 20
  } = filters;

  const query = String(q).toLowerCase().trim();

  let rows = state.materials.filter((m) => {
    if (branch && m.branch !== branch) return false;
    if (semester && m.semester !== semester) return false;
    if (subject && m.subject !== subject) return false;
    if (type && m.type !== type) return false;

    if (!query) return true;

    const title = String(m.title || '').toLowerCase();
    const matSubject = String(m.subject || '').toLowerCase();
    const code = String(m.code || '').toLowerCase();
    const desc = String(m.description || '').toLowerCase();

    return title.includes(query) || matSubject.includes(query) || code.includes(query) || desc.includes(query);
  });

  const sorters = {
    created_desc: (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
    created_asc: (a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')),
    title_asc: (a, b) => String(a.title || '').localeCompare(String(b.title || '')),
    title_desc: (a, b) => String(b.title || '').localeCompare(String(a.title || '')),
    semester_asc: (a, b) => Number(a.semester || 0) - Number(b.semester || 0),
    semester_desc: (a, b) => Number(b.semester || 0) - Number(a.semester || 0)
  };

  rows = rows.sort(sorters[sort] || sorters.created_desc);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const start = (safePage - 1) * safeLimit;
  const paged = rows.slice(start, start + safeLimit);

  return {
    data: paged,
    meta: {
      page: safePage,
      limit: safeLimit,
      total: rows.length,
      totalPages: Math.ceil(rows.length / safeLimit)
    }
  };
}

function createMaterial(payload, userId) {
  state.counters.materialId += 1;
  const material = {
    id: state.counters.materialId,
    ...payload,
    createdBy: Number(userId) || null,
    createdAt: nowIso(),
    updatedAt: null
  };
  state.materials.push(material);
  saveState(state);
  return material;
}

function updateMaterial(id, payload) {
  const numId = Number(id);
  const index = state.materials.findIndex((m) => m.id === numId);
  if (index < 0) {
    return null;
  }

  state.materials[index] = {
    ...state.materials[index],
    ...payload,
    updatedAt: nowIso()
  };
  saveState(state);
  return state.materials[index];
}

function deleteMaterial(id) {
  const numId = Number(id);
  const before = state.materials.length;
  state.materials = state.materials.filter((m) => m.id !== numId);
  const changed = state.materials.length !== before;
  if (changed) {
    saveState(state);
  }
  return changed;
}

module.exports = {
  ensureAdminUser,
  normalizeUser,
  findUserByEmail,
  findUserById,
  createUser,
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
