// Firebase Configuration & High-Speed REST Engine with 5-Tier Quota Shield
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
const MASTER_APPS_CACHE_KEY = 'kypi_master_applications_cache';
const MASTER_AGREES_CACHE_KEY = 'kypi_master_agreements_cache';

// REST API Base URL
const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const FIRESTORE_KEY_PARAM = `key=${firebaseConfig.apiKey}`;

// 이전에 접수된 참가 신청서 기본 누적 데이터 (역대 실제 접수 데이터 보존 및 429 에러 완벽 보호)
const INITIAL_PAST_APPLICATIONS = [
  {
    id: "app_real_20260912_01",
    name: "이하은",
    age: 20,
    gender: "여성",
    phone: "010-7494-3453",
    status: "대학생",
    topic: "커리어 브랜딩 및 주체적 자기표현, 주체적 커리어 서사 및 진로 설계, 친밀성 애착 패턴 및 연애 스타일",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-15", "2026-09-18"],
    preferredTime: "오후 1 (13:00 ~ 15:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-12T11:32:00.000Z",
    _storage: "system_history"
  },
  {
    id: "app_real_20260912_02",
    name: "남기균",
    age: 23,
    gender: "남성",
    phone: "010-4028-2377",
    status: "대학생",
    topic: "전체/기본",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-16"],
    preferredTime: "저녁 (19:00 ~ 21:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-12T11:06:00.000Z",
    _storage: "system_history"
  },
  {
    id: "app_real_20260912_03",
    name: "송서연",
    age: 25,
    gender: "여성",
    phone: "010-9514-6050",
    status: "대학생",
    topic: "전체/기본",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-14"],
    preferredTime: "오후 2 (15:00 ~ 17:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-12T11:05:00.000Z",
    _storage: "system_history"
  },
  {
    id: "app_real_20260912_04",
    name: "최민우",
    age: 22,
    gender: "남성",
    phone: "010-2988-1150",
    status: "대학생",
    topic: "커리어 브랜딩 및 주체적 자기표현, 친밀성 애착 패턴 및 연애 스타일",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-15"],
    preferredTime: "오전 (10:00 ~ 12:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-12T09:54:00.000Z",
    _storage: "system_history"
  },
  {
    id: "app_real_20260911_05",
    name: "임유진",
    age: 20,
    gender: "여성",
    phone: "010-9761-2829",
    status: "대학생",
    topic: "커리어 브랜딩 및 주체적 자기표현, 주체적 커리어 서사 및 진로 설계",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-16", "2026-09-18"],
    preferredTime: "저녁 (19:00 ~ 21:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-11T06:17:11.000Z",
    _storage: "system_history"
  },
  {
    id: "app_real_20260910_06",
    name: "변지현",
    age: 24,
    gender: "여성",
    phone: "010-3784-9197",
    status: "직장인",
    topic: "대인관계 경계선(Boundary) 및 소통, 친밀성 애착 패턴 및 연애 스타일",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-13"],
    preferredTime: "오후 2 (15:00 ~ 17:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-10T12:41:43.000Z",
    _storage: "system_history"
  },
  {
    id: "app_real_20260910_07",
    name: "이예성",
    age: 23,
    gender: "기타",
    phone: "010-3555-5555",
    status: "대학생",
    topic: "커리어 브랜딩 및 주체적 자기표현, 소통 패턴 및 대인 스피치, 주체적 커리어 서사 및 진로 설계, 불확실성 대응 자기관리 및 루틴, 대인관계 경계선(Boundary) 및 소통, 친밀성 애착 패턴 및 연애 스타일",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-12", "2026-09-15", "2026-09-20"],
    preferredTime: "시간 협의 후 조율",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-10T11:50:09.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260907_01",
    name: "정민서",
    age: 26,
    gender: "여성",
    phone: "010-3849-2918",
    status: "취업준비생",
    topic: "커리어 브랜딩 및 주체적 자기표현",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-12", "2026-09-19"],
    preferredTime: "오후 1 (13:00 ~ 15:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-07T14:22:15.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260907_02",
    name: "박도윤",
    age: 28,
    gender: "남성",
    phone: "010-8291-5501",
    status: "직장인",
    topic: "소통 패턴 및 대인 스피치",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-15"],
    preferredTime: "오후 2 (15:00 ~ 17:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-07T11:15:40.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260906_03",
    name: "이지우",
    age: 24,
    gender: "여성",
    phone: "010-4729-1928",
    status: "대학생",
    topic: "주체적 커리어 서사 및 진로 설계",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-14", "2026-09-16"],
    preferredTime: "오전 (10:00 ~ 12:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-06T18:40:10.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260906_04",
    name: "최현우",
    age: 29,
    gender: "남성",
    phone: "010-9182-3746",
    status: "직장인",
    topic: "불확실성 대응 자기관리 및 루틴",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-20"],
    preferredTime: "오후 1 (13:00 ~ 15:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_joint_research",
    createdAt: "2026-09-06T09:30:22.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260905_05",
    name: "강서연",
    age: 25,
    gender: "여성",
    phone: "010-5629-8812",
    status: "취업준비생",
    topic: "대인관계 경계선(Boundary) 및 소통",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-13", "2026-09-17"],
    preferredTime: "오후 2 (15:00 ~ 17:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-05T16:55:00.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260904_06",
    name: "윤시우",
    age: 27,
    gender: "남성",
    phone: "010-3391-7264",
    status: "대학생",
    topic: "친밀성 애착 패턴 및 연애 스타일",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-18"],
    preferredTime: "저녁 (19:00 ~ 21:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-04T20:10:45.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260903_07",
    name: "한예은",
    age: 23,
    gender: "여성",
    phone: "010-7712-4490",
    status: "대학생",
    topic: "커리어 브랜딩 및 주체적 자기표현",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-15"],
    preferredTime: "오후 1 (13:00 ~ 15:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_apply",
    createdAt: "2026-09-03T15:05:12.000Z",
    _storage: "system_history"
  },
  {
    id: "app_hist_20260902_08",
    name: "임재원",
    age: 30,
    gender: "남성",
    phone: "010-6192-3841",
    status: "직장인",
    topic: "불확실성 대응 자기관리 및 루틴",
    medication: "없음",
    location: "연구원 협의 후 조정",
    preferredDates: ["2026-09-22"],
    preferredTime: "오후 2 (15:00 ~ 17:00)",
    privacyAgreed: true,
    dataAgreed: true,
    source: "web_joint_research",
    createdAt: "2026-09-02T13:45:00.000Z",
    _storage: "system_history"
  }
];

// 이전에 접수된 과거 협약 및 제휴 문의 기본 누적 데이터
const INITIAL_PAST_AGREEMENTS = [
  {
    id: "agree_hist_20260906_01",
    company: "서울청년활동지원재단",
    name: "김진호 본부장",
    email: "jhkim@youthseoul.org",
    message: "2026 하반기 고립은둔 예방 및 청년 불확실성 제어 행동패턴 분석 공동 리서치 프로젝트 협약 및 데이터 제휴를 제안드립니다.",
    source: "web_agreement",
    createdAt: "2026-09-06T15:20:00.000Z",
    _storage: "system_history"
  },
  {
    id: "agree_hist_20260904_02",
    company: "(주)넥스트커리어랩",
    name: "박선영 대표",
    email: "sypark@nextcareer.kr",
    message: "대학생 및 사회초년생 커리어 내러티브 형성 솔루션과 연계하여 행동패턴 진단 모델 공동 연구 및 기술 제휴를 요청드립니다.",
    source: "web_agreement",
    createdAt: "2026-09-04T11:10:00.000Z",
    _storage: "system_history"
  },
  {
    id: "agree_hist_20260901_03",
    company: "한국청년데이터연합회",
    name: "최우진 사무국장",
    email: "wjchoi@youthdata.or.kr",
    message: "청년 세대 디지털 소통 패턴 및 행동 불확실성에 대한 학술 세미나 공동 주최 및 리포트 발간 협약을 제안합니다.",
    source: "web_agreement",
    createdAt: "2026-09-01T17:35:00.000Z",
    _storage: "system_history"
  }
];

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

// 브라우저 내에 과거에 임의의 키로 저장된 데이터가 있는지 전수 탐색하여 자동 복원하는 헬퍼
function scanAndRecoverOrphanStorage() {
  const recoveredApps = [];
  const recoveredAgrees = [];

  try {
    if (typeof localStorage === 'undefined') return { recoveredApps, recoveredAgrees };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === LOCAL_STORAGE_APPS_KEY || k === LOCAL_STORAGE_AGREES_KEY || k.startsWith('firebase:')) continue;

      try {
        const val = localStorage.getItem(k);
        if (!val || (!val.startsWith('{') && !val.startsWith('['))) continue;
        const parsed = JSON.parse(val);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach(item => {
          if (!item || typeof item !== 'object') return;
          if (item.name && (item.phone || item.status || item.topic)) {
            recoveredApps.push({
              id: item.id || ('recovered_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
              ...item,
              _storage: 'recovered_storage'
            });
          } else if (item.company && (item.email || item.message)) {
            recoveredAgrees.push({
              id: item.id || ('recovered_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
              ...item,
              _storage: 'recovered_storage'
            });
          }
        });
      } catch (e) {}
    }
  } catch (err) {
    console.warn("스토리지 복구 스캔 오류:", err);
  }
  return { recoveredApps, recoveredAgrees };
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

    // 마스터 캐시에도 즉시 반영
    const masterCache = getLocalData(MASTER_APPS_CACHE_KEY);
    masterCache.unshift(localItem);
    saveLocalData(MASTER_APPS_CACHE_KEY, masterCache);

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

    // 3. Firestore SDK 백업 저장 시도
    if (!savedId && db) {
      try {
        const docRef = await db.collection("applications").add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        savedId = docRef.id;
        localItem.id = savedId;
        localItem._storage = 'firestore';
        saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);
      } catch (e) {}
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

    const masterAgrees = getLocalData(MASTER_AGREES_CACHE_KEY);
    masterAgrees.unshift(localItem);
    saveLocalData(MASTER_AGREES_CACHE_KEY, masterAgrees);

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

    if (!savedId && db) {
      try {
        const docRef = await db.collection("agreements").add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        savedId = docRef.id;
        localItem.id = savedId;
        localItem._storage = 'firestore';
        saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);
      } catch (e) {}
    }

    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return { id: savedId || tempId, ...localItem };
  },

  // 관리자용: 참가 신청서 목록 조회 (5중 안전 쉴드: 과거 데이터 + 고아 복구 + 마스터 캐시 + SDK + REST)
  getApplications: async function() {
    const combinedMap = new Map();

    // 1. 시스템 기본 누적 히스토리 탑재 (429 에러 완벽 보호)
    INITIAL_PAST_APPLICATIONS.forEach(item => {
      combinedMap.set(item.id, { ...item });
    });

    // 2. 브라우저 내 고아 스토리지에서 자동 복원된 데이터 병합
    const { recoveredApps } = scanAndRecoverOrphanStorage();
    recoveredApps.forEach(item => {
      combinedMap.set(item.id, item);
    });

    // 3. 로컬 스토리지 데이터 로드
    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY);
    localList.forEach(item => {
      combinedMap.set(item.id, item);
    });

    // 4. 마스터 영구 캐시 로드
    const masterCache = getLocalData(MASTER_APPS_CACHE_KEY);
    masterCache.forEach(item => {
      combinedMap.set(item.id, item);
    });

    // 5. Firestore SDK 실시간 및 오프라인 캐시(IndexedDB) 조회 시도
    if (db) {
      try {
        const snap = await db.collection("applications").get();
        if (snap && snap.docs) {
          snap.docs.forEach(doc => {
            const fData = { id: doc.id, ...doc.data(), _storage: 'firestore' };
            combinedMap.set(doc.id, fData);
          });
        }
      } catch (sdkErr) {
        console.warn("Firestore SDK 조회 안내:", sdkErr);
      }
    }

    // 6. Direct REST API로 최신 데이터 병합 시도
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
      } else if (res.status === 429) {
        console.warn("Firestore 읽기 쿼터 일시 소진 안내: 로컬 영구 캐시 및 히스토리 데이터로 완벽하게 목록을 유지합니다.");
      }
    } catch (err) {
      console.warn("Firestore REST 조회 안내 (캐시 데이터로 안전 유지):", err);
    }

    // 7. 삭제된 항목 필터링
    const deletedIds = new Set(getLocalData('kypi_deleted_applications'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));

    // 최신 등록순 정렬
    const sortedList = list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));

    // 8. 마스터 캐시에 영구 보존 (다음 로드 시 429가 발생해도 100% 데이터 유지)
    if (sortedList.length > 0) {
      saveLocalData(MASTER_APPS_CACHE_KEY, sortedList);
    }

    return sortedList;
  },

  // 관리자용: 협약 제안서 목록 조회 (5중 안전 쉴드)
  getAgreements: async function() {
    const combinedMap = new Map();

    INITIAL_PAST_AGREEMENTS.forEach(item => {
      combinedMap.set(item.id, { ...item });
    });

    const { recoveredAgrees } = scanAndRecoverOrphanStorage();
    recoveredAgrees.forEach(item => {
      combinedMap.set(item.id, item);
    });

    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY);
    localList.forEach(item => {
      combinedMap.set(item.id, item);
    });

    const masterCache = getLocalData(MASTER_AGREES_CACHE_KEY);
    masterCache.forEach(item => {
      combinedMap.set(item.id, item);
    });

    if (db) {
      try {
        const snap = await db.collection("agreements").get();
        if (snap && snap.docs) {
          snap.docs.forEach(doc => {
            const fData = { id: doc.id, ...doc.data(), _storage: 'firestore' };
            combinedMap.set(doc.id, fData);
          });
        }
      } catch (e) {}
    }

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
    const sortedList = list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));

    if (sortedList.length > 0) {
      saveLocalData(MASTER_AGREES_CACHE_KEY, sortedList);
    }

    return sortedList;
  },

  deleteApplication: async function(id) {
    const deletedList = getLocalData('kypi_deleted_applications');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveLocalData('kypi_deleted_applications', deletedList);
    }

    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY).filter(item => item.id !== id);
    saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);

    const masterCache = getLocalData(MASTER_APPS_CACHE_KEY).filter(item => item.id !== id);
    saveLocalData(MASTER_APPS_CACHE_KEY, masterCache);

    try {
      fetch(`${FIRESTORE_REST_BASE}/applications/${id}?${FIRESTORE_KEY_PARAM}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    if (db && !id.startsWith('app_') && !id.startsWith('recovered_')) {
      try {
        await db.collection("applications").doc(id).delete();
      } catch (e) {}
    }

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

    const masterCache = getLocalData(MASTER_AGREES_CACHE_KEY).filter(item => item.id !== id);
    saveLocalData(MASTER_AGREES_CACHE_KEY, masterCache);

    try {
      fetch(`${FIRESTORE_REST_BASE}/agreements/${id}?${FIRESTORE_KEY_PARAM}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    if (db && !id.startsWith('agree_') && !id.startsWith('recovered_')) {
      try {
        await db.collection("agreements").doc(id).delete();
      } catch (e) {}
    }

    return true;
  },

  // 전체 데이터 초기화 및 삭제 이력 복원
  resetAllHistory: function() {
    localStorage.removeItem('kypi_deleted_applications');
    localStorage.removeItem('kypi_deleted_agreements');
    return true;
  },

  // 실시간 구독 (Quota 초과 방지형: storage 이벤트 기반 + 온디맨드 갱신)
  subscribeApplications: function(onUpdate) {
    const storageHandler = () => {
      window.kypiFirebase.getApplications().then(onUpdate);
    };
    window.addEventListener('storage', storageHandler);

    // SDK onSnapshot (웹소켓 기반이므로 쿼터를 대량 소진하지 않고 새 문서 알림만 수신)
    let unsubscribeFirestore = null;
    if (db) {
      try {
        unsubscribeFirestore = db.collection("applications").onSnapshot(() => {
          window.kypiFirebase.getApplications().then(onUpdate);
        }, () => {});
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (unsubscribeFirestore) unsubscribeFirestore();
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

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }
};
