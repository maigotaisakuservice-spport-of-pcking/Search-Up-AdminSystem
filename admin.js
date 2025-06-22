import { auth } from "./firebase-init.js";
import {
  getFirestore, doc, getDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "https://search-up.f5.si/auth.html";
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};
  if (!data.isAdmin) {
    alert("管理者専用ページです");
    location.href = "https://search-up.f5.si/index.html";
  } else {
    loadReports();
    loadAds();
  }
});

window.searchUser = async () => {
  const input = document.getElementById("user-search").value.trim();
  const q = query(collection(db, "users"), where("email", "==", input));
  const result = await getDocs(q);
  const userEl = document.getElementById("user-result");
  userEl.innerHTML = "";
  result.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${data.email}</strong><br/>
      プラン: ${data.plan}<br/>
      <button onclick="banUser('${docSnap.id}')">Ban</button>
      <button onclick="deleteUser('${docSnap.id}')">削除</button>
      <button onclick="toggleAdmin('${docSnap.id}', ${!!data.isAdmin})">
        ${data.isAdmin ? "isAdmin解除" : "isAdmin付与"}
      </button>
    `;
    userEl.appendChild(div);
  });
};

window.banUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { banned: true });
  alert("Banしました");
};

window.deleteUser = async (uid) => {
  await deleteDoc(doc(db, "users", uid));
  alert("削除しました");
};

window.toggleAdmin = async (uid, isAdminNow) => {
  await updateDoc(doc(db, "users", uid), { isAdmin: !isAdminNow });
  alert("変更しました");
};

window.addAd = async () => {
  const title = document.getElementById("ad-title").value.trim();
  const body = document.getElementById("ad-body").value.trim();
  const id = "ad-" + Date.now();
  await setDoc(doc(db, "ads", id), { title, body, timestamp: Date.now() });
  alert("広告を追加しました");
  loadAds();
};

const loadAds = async () => {
  const q = query(collection(db, "ads"));
  const result = await getDocs(q);
  const el = document.getElementById("ad-list");
  el.innerHTML = "";
  result.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${data.title}</strong>: ${data.body}`;
    el.appendChild(div);
  });
};

const loadReports = async () => {
  const q = query(collection(db, "reports"));
  const result = await getDocs(q);
  const el = document.getElementById("report-list");
  el.innerHTML = "";
  result.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML = `
      [${new Date(data.timestamp).toLocaleString()}] 
      <strong>${data.type}</strong>: ${data.detail}
    `;
    el.appendChild(div);
  });
};

window.refreshEvents = () => {
  alert("検索イベントを再構築しました（ダミー処理）");
};
