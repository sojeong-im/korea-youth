// Firebase Configuration & High-Speed REST Engine
const firebaseConfig = {
  apiKey: "AIzaSyCOoN61fcPzRayLfHhw1Mck7dXc6_s9qto",
  authDomain: "kypi-86af2.firebaseapp.com",
  projectId: "kypi-86af2",
  storageBucket: "kypi-86af2.firebasestorage.app",
  messagingSenderId: "845023522396",
  appId: "1:845023522396:web:7940b34d0fd2e63744c099",
  measurementId: "G-ZG4FHNK5QY"
};

// Initialize Firebase App
try {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (e) {
  console.warn("Firebase initializeApp 경고:", e);
}

const db = (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') ? firebase.firestore() : null;

// LocalStorage Keys
const LOCAL_STORAGE_APPS_KEY = 'kypi_stored_applications';
const LOCAL_STORAGE_AGREES_KEY = 'kypi_stored_agreements';

// REST API Base URL
const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const FIRESTORE_KEY_PARAM = `key=${firebaseConfig.apiKey}`;

function getLocalData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalData(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {}
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || k === 'id' || k === '_storage') continue;
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map(x => ({ stringValue: String(x) })) } };
  }
  if (!fields.createdAt) {
    fields.createdAt = { timestampValue: new Date().toISOString() };
  }
  return fields;
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.name) return null;
  const id = doc.name.split('/').pop();
  const res = { id: id, _storage: 'firestore' };
  
  if (doc.createTime) res.createdAt = doc.createTime;
  if (!doc.fields) return res;

  for (const [k, v] of Object.entries(doc.fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) res[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.arrayValue && v.arrayValue.values) {
      res[k] = v.arrayValue.values.map(item => item.stringValue || Object.values(item)[0]);
    }
  }
  return res;
}

function parseItemTimestamp(item) {
  if (!item) return 0;
  const ts = item.createdAt || item.timestamp || item.date || item.created_at || item.datetime;
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  if (typeof ts === 'number') return ts;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

// Timeout fetch wrapper (never hangs!)
async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Global helper objects
window.kypiFirebase = {
  db: db,
  lastFirestoreError: null,
  
  // 참가 신청서 저장
  saveApplication: async function(data) {
    const nowIso = new Date().toISOString();
    const tempId = 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    
    // 1. 로컬에 즉시 안전 저장
    const localItem = {
      id: tempId,
      ...data,
      createdAt: nowIso,
      _storage: 'local'
    };
    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY);
    localList.unshift(localItem);
    saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);

    let savedId = null;

    // 2. Direct REST API로 Firestore에 즉시 저장
    try {
      const restPayload = JSON.stringify({ fields: toFirestoreFields(data) });
      const res = await fetchWithTimeout(`${FIRESTORE_REST_BASE}/applications?${FIRESTORE_KEY_PARAM}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: restPayload
      }, 4000);
      if (res.ok) {
        const json = await res.json();
        savedId = json.name ? json.name.split('/').pop() : null;
        if (savedId) {
          localItem.id = savedId;
          localItem._storage = 'firestore';
          saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);
        }
      }
    } catch (err) {
      console.warn("REST API 저장 경고:", err);
    }

    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return { id: savedId || tempId, ...localItem };
  },

  // 협약 제안서 저장
  saveAgreement: async function(data) {
    const nowIso = new Date().toISOString();
    const tempId = 'agree_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const localItem = {
      id: tempId,
      ...data,
      createdAt: nowIso,
      _storage: 'local'
    };
    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY);
    localList.unshift(localItem);
    saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);

    let savedId = null;

    try {
      const restPayload = JSON.stringify({ fields: toFirestoreFields(data) });
      const res = await fetchWithTimeout(`${FIRESTORE_REST_BASE}/agreements?${FIRESTORE_KEY_PARAM}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: restPayload
      }, 4000);
      if (res.ok) {
        const json = await res.json();
        savedId = json.name ? json.name.split('/').pop() : null;
        if (savedId) {
          localItem.id = savedId;
          localItem._storage = 'firestore';
          saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);
        }
      }
    } catch (err) {}

    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return { id: savedId || tempId, ...localItem };
  },

  // 관리자용: 참가 신청서 목록 조회 (타임아웃 3초 보장)
  getApplications: async function() {
    const combinedMap = new Map();

    // 1. 로컬 데이터 먼저 로드 (화면 지연 0ms)
    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY);
    localList.forEach(item => {
      combinedMap.set(item.id, item);
    });

    // 2. Direct REST API로 Firestore 실시간 데이터 조회
    try {
      const res = await fetchWithTimeout(`${FIRESTORE_REST_BASE}/applications?${FIRESTORE_KEY_PARAM}&pageSize=100`, {
        cache: 'no-store'
      }, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.documents && Array.isArray(json.documents)) {
          json.documents.forEach(doc => {
            const parsed = parseFirestoreDoc(doc);
            if (parsed && parsed.id) {
              combinedMap.set(parsed.id, parsed);
            }
          });
        }
      }
    } catch (err) {
      console.warn("Firestore REST 조회 타임아웃 또는 실패:", err);
    }

    // 3. 삭제된 항목 필터링
    const deletedIds = new Set(getLocalData('kypi_deleted_applications'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));

    return list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));
  },

  // 관리자용: 협약 제안서 목록 조회
  getAgreements: async function() {
    const combinedMap = new Map();

    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY);
    localList.forEach(item => {
      combinedMap.set(item.id, item);
    });

    try {
      const res = await fetchWithTimeout(`${FIRESTORE_REST_BASE}/agreements?${FIRESTORE_KEY_PARAM}&pageSize=100`, {
        cache: 'no-store'
      }, 3500);
      if (res.ok) {
        const json = await res.json();
        if (json.documents && Array.isArray(json.documents)) {
          json.documents.forEach(doc => {
            const parsed = parseFirestoreDoc(doc);
            if (parsed && parsed.id) {
              combinedMap.set(parsed.id, parsed);
            }
          });
        }
      }
    } catch (err) {}

    const deletedIds = new Set(getLocalData('kypi_deleted_agreements'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));
    return list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));
  },

  deleteApplication: async function(id) {
    const deletedList = getLocalData('kypi_deleted_applications');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveLocalData('kypi_deleted_applications', deletedList);
    }

    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY).filter(item => item.id !== id);
    saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);

    try {
      fetch(`${FIRESTORE_REST_BASE}/applications/${id}?${FIRESTORE_KEY_PARAM}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    return true;
  },

  deleteAgreement: async function(id) {
    const deletedList = getLocalData('kypi_deleted_agreements');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveLocalData('kypi_deleted_agreements', deletedList);
    }

    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY).filter(item => item.id !== id);
    saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);

    try {
      fetch(`${FIRESTORE_REST_BASE}/agreements/${id}?${FIRESTORE_KEY_PARAM}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    return true;
  },

  // 전체 데이터 초기화 및 삭제 이력 복원
  resetAllHistory: function() {
    localStorage.removeItem('kypi_deleted_applications');
    localStorage.removeItem('kypi_deleted_agreements');
    return true;
  },

  // 실시간 구독 및 3초 자동 폴링
  subscribeApplications: function(onUpdate) {
    const storageHandler = () => {
      window.kypiFirebase.getApplications().then(onUpdate);
    };
    window.addEventListener('storage', storageHandler);

    const pollInterval = setInterval(() => {
      window.kypiFirebase.getApplications().then(onUpdate);
    }, 3000);

    return () => {
      window.removeEventListener('storage', storageHandler);
      clearInterval(pollInterval);
    };
  },

  subscribeAgreements: function(onUpdate) {
    const storageHandler = () => {
      window.kypiFirebase.getAgreements().then(onUpdate);
    };
    window.addEventListener('storage', storageHandler);

    const pollInterval = setInterval(() => {
      window.kypiFirebase.getAgreements().then(onUpdate);
    }, 3000);

    return () => {
      window.removeEventListener('storage', storageHandler);
      clearInterval(pollInterval);
    };
  }
};
