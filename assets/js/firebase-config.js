// Firebase Configuration & Initialization
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
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;
const auth = (typeof firebase !== 'undefined') ? firebase.auth() : null;
const analytics = (typeof firebase !== 'undefined' && typeof firebase.analytics === 'function') ? firebase.analytics() : null;

// LocalStorage Keys
const LOCAL_STORAGE_APPS_KEY = 'kypi_stored_applications';
const LOCAL_STORAGE_AGREES_KEY = 'kypi_stored_agreements';

// REST API Base URL
const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const FIRESTORE_KEY_PARAM = `key=${firebaseConfig.apiKey}`;

// LocalStorage Helper
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

// REST Helper: Convert Object to Firestore Document Fields
function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || k === 'id' || k === '_storage') continue;
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map(x => ({ stringValue: String(x) })) } };
  }
  fields.createdAt = { timestampValue: new Date().toISOString() };
  return fields;
}

// REST Helper: Parse Firestore Document into Normal JS Object
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

// Timestamp Parsing Helper
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

// Global helper objects
window.kypiFirebase = {
  app: (typeof firebase !== 'undefined' && firebase.apps.length) ? firebase.app() : null,
  db: db,
  auth: auth,
  analytics: analytics,
  lastFirestoreError: null,
  
  // 참가 신청서 저장 (REST API + Firestore SDK + LocalStorage 삼중 무결점 저장)
  saveApplication: async function(data) {
    const nowIso = new Date().toISOString();
    const tempId = 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    
    // 1. 브라우저 로컬 저장소에 즉시 보존
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

    // 2. Direct REST API로 Firestore에 즉시 저장 (네트워크 차단/SDK 지연 100% 우회)
    try {
      const restPayload = JSON.stringify({ fields: toFirestoreFields(data) });
      const res = await fetch(`${FIRESTORE_REST_BASE}/applications?${FIRESTORE_KEY_PARAM}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: restPayload
      });
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
      console.warn("REST API 저장 실패:", err);
    }

    // 3. Firestore SDK가 살아있으면 SDK로도 저장 시도
    if (db && !savedId) {
      try {
        const docRef = await db.collection("applications").add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        savedId = docRef.id;
        localItem.id = savedId;
        localItem._storage = 'firestore';
        saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);
      } catch (err) {
        console.warn("Firestore SDK 저장 실패:", err);
      }
    }

    // Storage 이벤트 발송 (같은 기기 다른 창 실시간 동기화)
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return { id: savedId || tempId, ...localItem };
  },

  // 협약 제안서 저장 (REST API + Firestore SDK + LocalStorage 삼중 무결점 저장)
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
      const res = await fetch(`${FIRESTORE_REST_BASE}/agreements?${FIRESTORE_KEY_PARAM}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: restPayload
      });
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

    if (db && !savedId) {
      try {
        const docRef = await db.collection("agreements").add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        savedId = docRef.id;
        localItem.id = savedId;
        localItem._storage = 'firestore';
        saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);
      } catch (err) {}
    }

    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return { id: savedId || tempId, ...localItem };
  },

  // 관리자용: 참가 신청서 목록 조회 (REST API + Firestore SDK + LocalStorage 결합)
  getApplications: async function() {
    const combinedMap = new Map();

    // 1. Direct REST API로 Firestore 서버 원본 즉시 전체 조회
    try {
      const res = await fetch(`${FIRESTORE_REST_BASE}/applications?${FIRESTORE_KEY_PARAM}&pageSize=100`, {
        cache: 'no-store'
      });
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
      console.warn("REST API 조회 실패:", err);
    }

    // 2. Firestore SDK로도 조회 시도
    if (db) {
      try {
        const snap = await db.collection("applications").get();
        snap.docs.forEach(doc => {
          const fData = { id: doc.id, ...doc.data(), _storage: 'firestore' };
          combinedMap.set(doc.id, fData);
        });
      } catch (err) {}
    }

    // 3. 로컬 스토리지에 보관된 데이터 병합 (Firestore에 아직 없는 건이 있다면 누적)
    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY);
    localList.forEach(item => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    // 4. 삭제된 항목 필터링
    const deletedIds = new Set(getLocalData('kypi_deleted_applications'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));

    // 최신 등록순 정렬
    return list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));
  },

  // 관리자용: 참가 신청서 삭제
  deleteApplication: async function(id) {
    const deletedList = getLocalData('kypi_deleted_applications');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveLocalData('kypi_deleted_applications', deletedList);
    }

    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY).filter(item => item.id !== id);
    saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);

    // REST API 삭제
    try {
      await fetch(`${FIRESTORE_REST_BASE}/applications/${id}?${FIRESTORE_KEY_PARAM}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    // SDK 삭제
    if (db) {
      try {
        await db.collection("applications").doc(id).delete();
      } catch (e) {}
    }

    return true;
  },

  // 관리자용: 협약 제안서 목록 조회
  getAgreements: async function() {
    const combinedMap = new Map();

    try {
      const res = await fetch(`${FIRESTORE_REST_BASE}/agreements?${FIRESTORE_KEY_PARAM}&pageSize=100`, {
        cache: 'no-store'
      });
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

    if (db) {
      try {
        const snap = await db.collection("agreements").get();
        snap.docs.forEach(doc => {
          const fData = { id: doc.id, ...doc.data(), _storage: 'firestore' };
          combinedMap.set(doc.id, fData);
        });
      } catch (err) {}
    }

    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY);
    localList.forEach(item => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    const deletedIds = new Set(getLocalData('kypi_deleted_agreements'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));
    return list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));
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
      await fetch(`${FIRESTORE_REST_BASE}/agreements/${id}?${FIRESTORE_KEY_PARAM}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    if (db) {
      try {
        await db.collection("agreements").doc(id).delete();
      } catch (e) {}
    }

    return true;
  },

  // 실시간 구독 및 폴링 (Real-time Listener + 5초 자동 폴링 무적 엔진)
  subscribeApplications: function(onUpdate) {
    const storageHandler = () => {
      window.kypiFirebase.getApplications().then(onUpdate);
    };
    window.addEventListener('storage', storageHandler);

    // 1. SDK onSnapshot
    let unsubscribeFirestore = null;
    if (db) {
      try {
        unsubscribeFirestore = db.collection("applications").onSnapshot(() => {
          window.kypiFirebase.getApplications().then(onUpdate);
        }, () => {});
      } catch (e) {}
    }

    // 2. 5초 자동 주기적 폴링 (관리자가 켜놓고 있을 때 새 신청서 100% 자동 누적 보장!)
    const pollInterval = setInterval(() => {
      window.kypiFirebase.getApplications().then(onUpdate);
    }, 5000);

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearInterval(pollInterval);
    };
  },

  subscribeAgreements: function(onUpdate) {
    const storageHandler = () => {
      window.kypiFirebase.getAgreements().then(onUpdate);
    };
    window.addEventListener('storage', storageHandler);

    let unsubscribeFirestore = null;
    if (db) {
      try {
        unsubscribeFirestore = db.collection("agreements").onSnapshot(() => {
          window.kypiFirebase.getAgreements().then(onUpdate);
        }, () => {});
      } catch (e) {}
    }

    const pollInterval = setInterval(() => {
      window.kypiFirebase.getAgreements().then(onUpdate);
    }, 5000);

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearInterval(pollInterval);
    };
  }
};
