import Image from "next/image";
import useDevice from "@/lib/useDevice";
import useAuth from "@/lib/useAuth";

// icons
import { VscEdit } from "react-icons/vsc";
import NotUser from "../NotUser";

export default function HomePage() {
  const user = useAuth();
  const mobile = useDevice();

  if (!user) return <NotUser />;
  if (mobile) return <Mobile />;
  return (
    <main className="w-screen h-screen  m-auto p-12 bg-slate-600">
      <div className="flex  w-full h-full rounded-xl overflow-hidden">
        {/* 메뉴 */}
        <div className="w-3/12 h-full bg-slate-50 p-6">
          {/* 프로필 */}
          <div className="w-full flex justify-between items-center gap-4 truncate">
            {/* 프로필 이미지 */}
            <div className="flex justify-center items-center">
              <Image src={`/user.png`} width={90} height={90} alt="user_icon" />
            </div>
            {/* 이름, 상태메시지 */}
            <div className="flex flex-col truncate">
              <p className="text-lg text-blue-500">{user.displayName}</p>
              <p className="text-sm text-gray-500 truncate">상태메시지asdasdasdasdasdaasdasdasdasdasdssdasdasds</p>
            </div>
          </div>
          {/* 검색 창 */}
          <div></div>
        </div>
        {/* 채팅 화면 */}
        <div className="w-9/12 h-full bg-white p-8">d</div>
      </div>
    </main>
  );
}

const Mobile = () => {
  return <div></div>;
};
