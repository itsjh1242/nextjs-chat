import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/db/firebase";
import { initOnline } from "@/controller/chat";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
};

export const useLeaveObserver = (uid: string) => {
  useEffect(() => {
    if (!uid) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 동기적으로 처리할 수 있는 작업
      initOnline({ host: uid })
        .then(() => {
          console.log("사용자 로그아웃");
        })
        .catch((error) => {
          console.error("beforeUnload 에러: ", error);
        });

      // 이벤트 핸들러에서 기본적으로 해야 할 작업
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uid]);
};
