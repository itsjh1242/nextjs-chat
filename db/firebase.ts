import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithPopup } from "firebase/auth";
import { initOnline } from "@/controller/chat";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// 애플리케이션을 초기화하거나 이미 초기화된 경우 기존 애플리케이션 인스턴스를 가져오는 작업을 수행
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const userCollection = collection(db, "user");
const onlineCollection = collection(db, "online");

// 구글 로그인
async function signInWithGoogle() {
  try {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;

    const userDocRef = doc(userCollection, user.uid);
    const onlineDocRef = doc(onlineCollection, user.uid);
    // 사용자 문서 가져오기
    const userDoc = await getDoc(userDocRef);
    // 신규 사용자일 경우에만 사용자 등록 및 초기화 && 채팅방 1대1 온라인 상태 초기화
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName,
        tag: user.email,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        friends: {},
        status_msg: "아직 상태 메시지가 없습니다.",
      });
      await setDoc(onlineDocRef, {
        uid: user.uid,
        target: null,
      });
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

// 로그아웃
async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}

export { app, auth, db, provider, signInWithGoogle, signOut };
