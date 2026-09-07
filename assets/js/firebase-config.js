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

// Global helper objects
window.kypiFirebase = {
  app: (typeof firebase !== 'undefined' && firebase.apps.length) ? firebase.app() : null,
  db: db,
  auth: auth,
  analytics: analytics,
  
  // 참가 신청서 저장
  saveApplication: async function(data) {
    if (!db) throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
    return await db.collection("applications").add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // 협약 제안서 저장
  saveAgreement: async function(data) {
    if (!db) throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
    return await db.collection("agreements").add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // 관리자용: 참가 신청서 목록 조회
  getApplications: async function() {
    if (!db) throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
    const snap = await db.collection("applications").get();
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return list.sort((a, b) => {
      const getMs = (item) => {
        if (!item || !item.createdAt) return 0;
        if (typeof item.createdAt.toMillis === 'function') return item.createdAt.toMillis();
        if (item.createdAt.seconds) return item.createdAt.seconds * 1000;
        const d = new Date(item.createdAt);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return getMs(b) - getMs(a);
    });
  },

  // 관리자용: 참가 신청서 삭제
  deleteApplication: async function(id) {
    if (!db) throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
    return await db.collection("applications").doc(id).delete();
  },

  // 관리자용: 협약 제안서 목록 조회
  getAgreements: async function() {
    if (!db) throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
    const snap = await db.collection("agreements").get();
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return list.sort((a, b) => {
      const getMs = (item) => {
        if (!item || !item.createdAt) return 0;
        if (typeof item.createdAt.toMillis === 'function') return item.createdAt.toMillis();
        if (item.createdAt.seconds) return item.createdAt.seconds * 1000;
        const d = new Date(item.createdAt);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return getMs(b) - getMs(a);
    });
  },

  // 관리자용: 협약 제안서 삭제
  deleteAgreement: async function(id) {
    if (!db) throw new Error("Firebase Firestore가 초기화되지 않았습니다.");
    return await db.collection("agreements").doc(id).delete();
  }
};
