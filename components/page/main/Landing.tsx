"use client";
import HomePage from "@/components/page/main/Home";
import { CustomButton } from "@/components/ui/Buttons";

import { signInWithGoogle } from "@/db/firebase";
import useAuth from "@/lib/useAuth";

export default function LandingPage() {
  const user = useAuth();
  // 구글 로그인
  const handleLogin = () => {
    signInWithGoogle();
  };

  if (user) return <HomePage />;
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold animate-fade-in-up">Chat</h1>
      <p className="mt-2 animate-fade-in-up">실시간 채팅 서비스</p>
      <div className="flex space-x-4 mt-3 animate-fade-in-up">
        <CustomButton
          onClick={() => {
            handleLogin();
          }}
        >
          구글 로그인으로 시작하기
        </CustomButton>
      </div>
    </main>
  );
}
