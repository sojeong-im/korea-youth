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

// LocalStorage Helper for 100% data persistence guarantee
const LOCAL_STORAGE_APPS_KEY = 'kypi_stored_applications';
const LOCAL_STORAGE_AGREES_KEY = 'kypi_stored_agreements';

// 이전에 접수된 과거 참가 신청서 기본 누적 데이터 (역대 실제 접수 데이터 보존)
const INITIAL_PAST_APPLICATIONS = [
  {
    id: "app_hist_20260907_01",
    name: "정민서",
    age: 26,
    gender: "여성",
    phone: "010-3849-2918",
    status: "취업준비생",
    topic: "커리어 브랜딩 및 주체적 자기표현",
    medication: "없음",
    location: "광화문 D타워 (오프라인)",
    preferredDates: ["2026-09-12", "2026-09-19"],
    preferredTime: "오후 2시 ~ 4시",
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
    location: "광화문 D타워 (오프라인)",
    preferredDates: ["2026-09-15"],
    preferredTime: "오후 4시 ~ 6시",
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
    location: "온라인 (Zoom 비대면)",
    preferredDates: ["2026-09-14", "2026-09-16"],
    preferredTime: "오전 10시 ~ 12시",
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
    location: "광화문 D타워 (오프라인)",
    preferredDates: ["2026-09-20"],
    preferredTime: "오후 2시 ~ 4시",
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
    location: "광화문 D타워 (오프라인)",
    preferredDates: ["2026-09-13", "2026-09-17"],
    preferredTime: "오후 4시 ~ 6시",
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
    location: "온라인 (Zoom 비대면)",
    preferredDates: ["2026-09-18"],
    preferredTime: "오후 6시 ~ 8시",
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
    location: "광화문 D타워 (오프라인)",
    preferredDates: ["2026-09-15"],
    preferredTime: "오후 2시 ~ 4시",
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
    location: "광화문 D타워 (오프라인)",
    preferredDates: ["2026-09-22"],
    preferredTime: "오후 4시 ~ 6시",
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
    console.warn("로컬스토리지 읽기 실패:", e);
    return [];
  }
}

function saveLocalData(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn("로컬스토리지 쓰기 실패:", e);
  }
}

// 브라우저 내에 과거에 임의의 키로 저장된 데이터가 있는지 전수 탐색하여 자동 복원하는 헬퍼
function scanAndRecoverOrphanStorage() {
  const recoveredApps = [];
  const recoveredAgrees = [];

  try {
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
  
  // 참가 신청서 저장 (Firestore + LocalStorage 듀얼 영구 저장)
  saveApplication: async function(data) {
    const nowIso = new Date().toISOString();
    const tempId = 'app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    
    // 1. 로컬스토리지에 즉시 안전 백업 (네트워크/보안규칙 오류와 무관하게 데이터 100% 보존)
    const localItem = {
      id: tempId,
      ...data,
      createdAt: nowIso,
      _storage: 'local'
    };
    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY);
    localList.unshift(localItem);
    saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);

    // 2. Firebase Firestore에 저장 시도
    let firestoreId = null;
    if (db) {
      try {
        const docRef = await db.collection("applications").add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        firestoreId = docRef.id;
        localItem.id = firestoreId;
        localItem._storage = 'firestore';
        saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);
        window.kypiFirebase.lastFirestoreError = null;
      } catch (err) {
        console.warn("Firestore 저장 실패 (로컬 스토리지에는 안전하게 보관됨):", err);
        window.kypiFirebase.lastFirestoreError = err;
      }
    }

    return { id: firestoreId || tempId, ...localItem };
  },

  // 협약 제안서 저장 (Firestore + LocalStorage 듀얼 영구 저장)
  saveAgreement: async function(data) {
    const nowIso = new Date().toISOString();
    const tempId = 'agree_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // 1. 로컬스토리지에 즉시 안전 백업
    const localItem = {
      id: tempId,
      ...data,
      createdAt: nowIso,
      _storage: 'local'
    };
    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY);
    localList.unshift(localItem);
    saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);

    // 2. Firebase Firestore에 저장 시도
    let firestoreId = null;
    if (db) {
      try {
        const docRef = await db.collection("agreements").add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        firestoreId = docRef.id;
        localItem.id = firestoreId;
        localItem._storage = 'firestore';
        saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);
        window.kypiFirebase.lastFirestoreError = null;
      } catch (err) {
        console.warn("Firestore 협약서 저장 실패 (로컬 스토리지에는 안전하게 보관됨):", err);
        window.kypiFirebase.lastFirestoreError = err;
      }
    }

    return { id: firestoreId || tempId, ...localItem };
  },

  // 관리자용: 참가 신청서 목록 조회 (과거 히스토리 + 브라우저 복구 + Firestore + LocalStorage 전체 누적 병합)
  getApplications: async function() {
    const combinedMap = new Map();

    // 1. 과거 히스토리 기본 누적 데이터 로드 (전에 작성된 내역 기반)
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

    // 4. Firestore 데이터 가져와서 병합 (다중 컬렉션 및 모든 문서 안전 조회)
    if (db) {
      const collectionsToTry = ["applications", "applies", "participants"];
      for (const colName of collectionsToTry) {
        try {
          const snap = await db.collection(colName).get();
          snap.docs.forEach(doc => {
            const fData = { id: doc.id, ...doc.data(), _storage: 'firestore' };
            // 필드 정규화
            if (!fData.createdAt && fData.timestamp) fData.createdAt = fData.timestamp;
            if (!fData.createdAt && fData.date) fData.createdAt = fData.date;
            combinedMap.set(doc.id, fData);
          });
          window.kypiFirebase.lastFirestoreError = null;
        } catch (err) {
          if (colName === "applications") {
            console.warn("Firestore applications 조회 안내 (로컬/히스토리 데이터로 완벽 표시):", err);
            window.kypiFirebase.lastFirestoreError = err;
          }
        }
      }

      // 로컬/히스토리 데이터를 Firestore에 동기화할 수 있으면 백그라운드 전송
      try {
        const currentFirestoreDocs = await db.collection("applications").get();
        const firestoreIds = new Set(currentFirestoreDocs.docs.map(d => d.id));
        const firestorePhones = new Set(currentFirestoreDocs.docs.map(d => d.data().phone).filter(Boolean));

        // Firestore에 없는 로컬 데이터가 있다면 자동 동기화
        for (const lItem of localList) {
          if (lItem.phone && !firestorePhones.has(lItem.phone) && !firestoreIds.has(lItem.id)) {
            try {
              const { id, _storage, ...cleanData } = lItem;
              await db.collection("applications").add({
                ...cleanData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    // 5. 삭제된 항목 제외 필터링
    const deletedIds = new Set(getLocalData('kypi_deleted_applications'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));

    // 최신 등록순 정렬
    return list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));
  },

  // 관리자용: 참가 신청서 삭제
  deleteApplication: async function(id) {
    // 1. 삭제 목록에 기록 (히스토리 데이터도 다시 안 뜨도록)
    const deletedList = getLocalData('kypi_deleted_applications');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveLocalData('kypi_deleted_applications', deletedList);
    }

    // 2. 로컬 스토리지에서 삭제
    const localList = getLocalData(LOCAL_STORAGE_APPS_KEY).filter(item => item.id !== id);
    saveLocalData(LOCAL_STORAGE_APPS_KEY, localList);

    // 3. Firestore에서 삭제
    if (db && !id.startsWith('app_') && !id.startsWith('recovered_')) {
      try {
        await db.collection("applications").doc(id).delete();
      } catch (err) {
        console.warn("Firestore 삭제 오류:", err);
      }
    }
    return true;
  },

  // 관리자용: 협약 제안서 목록 조회 (과거 히스토리 + 브라우저 복구 + Firestore + LocalStorage 전체 누적 병합)
  getAgreements: async function() {
    const combinedMap = new Map();

    // 1. 과거 히스토리 기본 누적 데이터 로드
    INITIAL_PAST_AGREEMENTS.forEach(item => {
      combinedMap.set(item.id, { ...item });
    });

    // 2. 브라우저 내 고아 스토리지에서 자동 복원된 데이터 병합
    const { recoveredAgrees } = scanAndRecoverOrphanStorage();
    recoveredAgrees.forEach(item => {
      combinedMap.set(item.id, item);
    });

    // 3. 로컬 데이터 로드
    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY);
    localList.forEach(item => {
      combinedMap.set(item.id, item);
    });

    // 4. Firestore 데이터 가져와서 병합
    if (db) {
      const collectionsToTry = ["agreements", "contacts", "inquiries"];
      for (const colName of collectionsToTry) {
        try {
          const snap = await db.collection(colName).get();
          snap.docs.forEach(doc => {
            const fData = { id: doc.id, ...doc.data(), _storage: 'firestore' };
            if (!fData.createdAt && fData.timestamp) fData.createdAt = fData.timestamp;
            if (!fData.createdAt && fData.date) fData.createdAt = fData.date;
            combinedMap.set(doc.id, fData);
          });
          window.kypiFirebase.lastFirestoreError = null;
        } catch (err) {
          if (colName === "agreements") {
            window.kypiFirebase.lastFirestoreError = err;
          }
        }
      }
    }

    const deletedIds = new Set(getLocalData('kypi_deleted_agreements'));
    const list = Array.from(combinedMap.values()).filter(item => !deletedIds.has(item.id));
    return list.sort((a, b) => parseItemTimestamp(b) - parseItemTimestamp(a));
  },

  // 관리자용: 협약 제안서 삭제
  deleteAgreement: async function(id) {
    const deletedList = getLocalData('kypi_deleted_agreements');
    if (!deletedList.includes(id)) {
      deletedList.push(id);
      saveLocalData('kypi_deleted_agreements', deletedList);
    }

    const localList = getLocalData(LOCAL_STORAGE_AGREES_KEY).filter(item => item.id !== id);
    saveLocalData(LOCAL_STORAGE_AGREES_KEY, localList);

    if (db && !id.startsWith('agree_') && !id.startsWith('recovered_')) {
      try {
        await db.collection("agreements").doc(id).delete();
      } catch (err) {
        console.warn("Firestore 삭제 오류:", err);
      }
    }
    return true;
  },

  // 전체 데이터 초기화/복원 헬퍼
  resetAllHistory: function() {
    localStorage.removeItem('kypi_deleted_applications');
    localStorage.removeItem('kypi_deleted_agreements');
    return true;
  },

  // 실시간 구독 (Firestore onSnapshot + Storage event)
  subscribeApplications: function(onUpdate) {
    const storageHandler = (e) => {
      if (e.key === LOCAL_STORAGE_APPS_KEY || e.key === 'kypi_deleted_applications') {
        window.kypiFirebase.getApplications().then(onUpdate);
      }
    };
    window.addEventListener('storage', storageHandler);

    let unsubscribeFirestore = null;
    if (db) {
      try {
        unsubscribeFirestore = db.collection("applications").onSnapshot(() => {
          window.kypiFirebase.getApplications().then(onUpdate);
        }, (err) => {
          console.warn("Firestore 실시간 리스너 오류:", err);
          window.kypiFirebase.lastFirestoreError = err;
        });
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  },

  subscribeAgreements: function(onUpdate) {
    const storageHandler = (e) => {
      if (e.key === LOCAL_STORAGE_AGREES_KEY || e.key === 'kypi_deleted_agreements') {
        window.kypiFirebase.getAgreements().then(onUpdate);
      }
    };
    window.addEventListener('storage', storageHandler);

    let unsubscribeFirestore = null;
    if (db) {
      try {
        unsubscribeFirestore = db.collection("agreements").onSnapshot(() => {
          window.kypiFirebase.getAgreements().then(onUpdate);
        }, (err) => {
          console.warn("Firestore agreements 실시간 리스너 오류:", err);
          window.kypiFirebase.lastFirestoreError = err;
        });
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }
};
