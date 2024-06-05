"use client";
import { handleLogin, useAuth, handleLogOut, useLeaveObserver } from "@/lib/useAuth";
import useDevice from "@/lib/useDevice";

import Mobile from "./Mobile";
import HomePage from "@/components/page/main/Home";
import { useUser } from "@/lib/useUser";
import { CustomButton } from "@/components/ui/Buttons";

export default function LandingPage() {
  const isLogin = useAuth();
  const mobile = useDevice();
  const userData = useUser();
  useLeaveObserver(userData.user?.uid);

  if (!isLogin && !userData.user) return <LoginForm />;
  if (mobile) return <Mobile userData={userData} isLogin={isLogin} logout={handleLogOut} />;
  else return <HomePage userData={userData} isLogin={isLogin} logout={handleLogOut} />;
}

const LoginForm = () => {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold animate-fade-in-up">Chat</h1>
      <p className="mt-2 animate-fade-in-up">실시간 채팅 서비스</p>
      <div className="flex space-x-4 mt-3 animate-fade-in-up">
        <CustomButton onClick={handleLogin}>구글 로그인으로 시작하기</CustomButton>
      </div>
    </main>
  );
};
