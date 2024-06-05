import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { DocumentData } from "firebase/firestore";
import { getUser } from "@/controller/user";

export function useUser() {
  const isLogin = useAuth();
  const [user, setUser] = useState<DocumentData | null>(null);

  // 프로필 수정 모달 제어 핸들
  const [modalEditProfile, setModalEditProfile] = useState<boolean>(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    if (!isLogin) return;

    const handleGetUser = async (user: any) => {
      setUser(user);
    };

    // 실시간 가져오기
    const fetchUser = async () => {
      const unsubscribe = await getUser(handleGetUser);
      console.log("fetchUser");
      if (unsubscribe) {
        return () => unsubscribe();
      }
    };

    fetchUser();
  }, [isLogin]);

  return { user: user, modalEditProfile: modalEditProfile, setModalEditProfile: setModalEditProfile };
}
