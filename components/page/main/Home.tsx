import Image from "next/image";
import useDevice from "@/lib/useDevice";
import useAuth from "@/lib/useAuth";

import Mobile from "./Mobile";
import NotUser from "../NotUser";
import { RoundedNumberBadge } from "@/components/ui/Badge";

// icons
import { VscSmiley, VscSend } from "react-icons/vsc";

export default function HomePage() {
  const user = useAuth();
  const mobile = useDevice();

  if (!user) return <NotUser />;
  if (mobile) return <Mobile />;
  return (
    <main className="w-screen h-screen  m-auto p-12 bg-slate-600">
      <div className="flex  w-full h-full rounded-xl overflow-hidden">
        {/* 메뉴 */}
        <div className="flex flex-col gap-8 w-3/12 h-full bg-slate-50 p-6">
          {/* 프로필 */}
          <div className="w-full flex justify-between items-center gap-4">
            {/* 프로필 이미지 */}
            <div className="flex justify-center items-center">
              <Image src={`/user.png`} width={80} height={80} alt="user_icon" />
            </div>
            {/* 이름, 상태메시지 */}
            <div className="flex flex-col truncate">
              <p className="text-lg text-blue-500 font-semibold">{user.displayName}</p>
              <p className="text-sm text-gray-500 truncate">상태메시지asdasdasdasdasdaasdasdasdasdasdssdasdasds</p>
            </div>
          </div>
          {/* 친구 찾기 - 아이디 검색 */}
          <div>
            <input
              type="text"
              placeholder="아이디를 입력하여 친구를 추가하세요"
              className="w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
          </div>
          {/* 친구 목록 */}
          <div className="h-full flex flex-col gap-4">
            <FriendListItem />
            <FriendListItem />
            <FriendListItem />
          </div>
        </div>
        {/* 채팅 화면 */}
        <div className="w-9/12 h-full flex flex-col bg-white px-8 pb-4">
          {/* 헤더 */}
          <div className="grow-1 border-b-2 flex justify-center items-center">
            <div className="w-full flex justify-between items-center gap-4">
              {/* 프로필 이미지 */}
              <div className="flex justify-center items-center">
                <Image src={`/user.png`} width={60} height={60} alt="user_icon" />
              </div>
              {/* 이름, 상태메시지 */}
              <div className="w-full flex flex-col items-start">
                <p className="text-xl font-semibold">친구 1</p>
              </div>
            </div>
          </div>
          {/* 채팅 박스 */}
          <div className="grow-10 flex flex-col justify-end gap-4">
            {/* 상대방 */}
            <div className="flex gap-2 items-end">
              <div className="flex justify-center items-center">
                <Image src={`/user.png`} width={30} height={30} alt="user_icon" />
              </div>
              <p className="max-w-half bg-slate-100 px-4 py-2 text-sm rounded-tr-xl rounded-tl-xl rounded-br-xl">
                채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2
              </p>
            </div>
            {/* 나 */}
            <div className="flex justify-end gap-2 items-end">
              <p className="max-w-half bg-blue-500 text-white px-4 py-2 text-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl">
                채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2채팅2
              </p>
              <div className="flex justify-center items-center">
                <Image src={`/user.png`} width={30} height={30} alt="user_icon" />
              </div>
            </div>
          </div>
          {/* 채팅 입력 */}
          <div className="grow-1 flex justify-center items-center pt-2">
            <div className="w-full h-2/3 flex justify-between items-center gap-2 rounded-full bg-slate-200 px-8">
              <input type="text" placeholder="채팅을 입력하세요" className="bg-transparent outline-none w-10/12" />
              <div className="flex justify-end items-center w-1/12">
                <VscSmiley size={24} color="#6D6D6D" className="cursor-pointer" />
              </div>
              <div className="w-fit h-fit flex justify-center items-center cursor-pointer p-2 rounded-full bg-blue-500 ">
                <VscSend size={24} color="#ffffff" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const FriendListItem = () => {
  return (
    <div className="w-full flex justify-between items-center gap-4 truncate cursor-pointer">
      {/* 프로필 이미지 */}
      <div className="flex justify-center items-center">
        <Image src={`/user.png`} width={60} height={60} alt="user_icon" />
      </div>
      {/* 이름, 상태메시지 */}
      <div className="w-full flex flex-col items-start truncate">
        <p className="text-lg text-blue-500 font-semibold">친구 1</p>
        <p className="text-xs text-gray-500">마지막으로 보낸 메시지</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {/* 마지막 메시지 보낸 시간 */}
        <p className="text-xs text-gray-400">10:34 AM</p>
        <RoundedNumberBadge>12</RoundedNumberBadge>
      </div>
    </div>
  );
};
