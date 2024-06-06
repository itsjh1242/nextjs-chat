"use client";
import Image from "next/image";
import { handleLogin, useAuth, handleLogOut, useLeaveObserver } from "@/lib/useAuth";

import HomePage from "@/components/page/main/Home";
import { useUser } from "@/lib/useUser";
import { CustomButton } from "@/components/ui/Buttons";
import { Emoji_LoveLetter } from "@/components/ui/Emoji";

export default function LandingPage() {
  const isLogin = useAuth();

  const userData = useUser();
  useLeaveObserver(userData.user?.uid);

  if (!isLogin && !userData.user) return <LoginForm />;
  else return <HomePage userData={userData} isLogin={isLogin} logout={handleLogOut} />;
}

const LoginForm = () => {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12">
      <Emoji_LoveLetter />
      <h1 className="text-4xl font-bold animate-fade-in-up">Chat</h1>
      <p className="mt-2 animate-fade-in-up">실시간 채팅 플랫폼</p>
      <div className="flex space-x-4 mt-3 animate-fade-in-up">
        <CustomButton onClick={handleLogin} color="gray">
          <div className="flex justify-center items-center gap-4">
            <Image src={`/google.svg`} alt="google" width={30} height={30} />
            <p>Google 로그인</p>
          </div>
        </CustomButton>
      </div>
    </main>
  );
};
