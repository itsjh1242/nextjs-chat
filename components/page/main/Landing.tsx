"use client";
import { useState, useEffect } from "react";
import useAuth from "@/lib/useAuth";
import HomePage from "@/components/page/main/Home";
import { CustomButton } from "@/components/ui/Buttons";
import { getUser } from "@/controller/user";
import { signInWithGoogle } from "@/db/firebase";
import { DocumentData } from "firebase/firestore";

export default function LandingPage() {
  const isLogin = useAuth();
  const [user, setUser] = useState<DocumentData | null>(null);

  // 사용자 정보 가져오기
  const fetchData = async () => {
    const currentUser = await getUser();
    if (currentUser !== undefined) {
      setUser(currentUser);
    }
  };

  useEffect(() => {
    const fetchDataOnMount = async () => {
      if (isLogin) {
        await fetchData();
      }
    };
    fetchDataOnMount();
  }, [isLogin]);

  // 구글 로그인
  const handleLogin = async () => {
    await signInWithGoogle();
  };

  if (isLogin && user) return <HomePage user={user} />;

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold animate-fade-in-up">Chat</h1>
      <p className="mt-2 animate-fade-in-up">실시간 채팅 서비스</p>
      <div className="flex space-x-4 mt-3 animate-fade-in-up">
        <CustomButton onClick={handleLogin}>구글 로그인으로 시작하기</CustomButton>
      </div>
    </main>
  );
}
