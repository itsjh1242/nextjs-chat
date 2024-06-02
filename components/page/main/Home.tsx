"use client";
import { useState, useEffect } from "react";

import { acceptRequest, getFriends, requestFriend } from "@/controller/user";
import Image from "next/image";
import useDevice from "@/lib/useDevice";
import useAuth from "@/lib/useAuth";
import { signOut } from "@/db/firebase";

// ui
import Mobile from "./Mobile";
import NotUser from "../NotUser";
import { Loading, LoadingFriendsList } from "../Loading";
import { Badge, RoundedNumberBadge } from "@/components/ui/Badge";
import { CustomButtonSmall } from "@/components/ui/Buttons";

// icons
import { VscSmiley, VscSend, VscUnlock, VscEdit } from "react-icons/vsc";
import { EditProfile } from "./Modal";

export default function HomePage({ user }: { user: any }) {
  const isLogin = useAuth();
  const mobile = useDevice();

  // 친구 목록 제어 핸들
  const [friends, setFriends] = useState<any[] | null>(null);
  // 프로필 수정 모달 제어 핸들
  const [modalEditProfile, setModalEditProfile] = useState(false);

  // 친구 목록 실시간 업데이트
  useEffect(() => {
    if (!user) return;

    // 친구 목록 업데이트 함수
    const handleFriendsUpdate = (updatedFriends: any[]) => {
      setFriends(updatedFriends);
    };
    // 친구 목록을 가져오고 실시간 업데이트
    const fetchFriends = async () => {
      const unsubscribe = await getFriends({ uid: user.uid }, handleFriendsUpdate);

      return () => unsubscribe();
    };

    fetchFriends();
  }, [user]);

  // 친구 찾기 핸들러
  const findHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const target = (event.target as HTMLInputElement).value;
      if (!target.match("#")) {
        return alert("사용자 명과 태그를 입력해주세요. 예) 이름#태그");
      }
      const res = await requestFriend({ uid: user.uid, target: target });

      switch (res?.msg) {
        case "ERR_NOT_USER":
          return alert("입력하신 아이디와 일치하는 사용자가 없습니다.");
        case "ERR_ALREADY_REQ":
          return alert("이미 친구요청을 보냈습니다. 기다려보세요.");
        case "ERR_ALREADY_FRIENDS":
          return alert("두 분은 이미 친구네요.");
        case "ERR_SELF":
          return alert("자기 자신에게 친구 요청을 보내셨나요...?");
        case "SUC_ADD":
          return alert("친구요청을 보냈습니다.");
        default:
          return alert("ERR!");
      }
    }
  };

  if (!isLogin) return <NotUser />;
  if (!user) return <Loading />;
  if (mobile) return <Mobile />;

  return (
    <main className="w-screen h-screen  m-auto p-12 bg-slate-600">
      {modalEditProfile ? (
        <EditProfile
          user={user}
          close={() => {
            setModalEditProfile(!modalEditProfile);
          }}
        />
      ) : null}
      <div className="flex  w-full h-full rounded-xl overflow-hidden">
        {/* 메뉴 */}
        <div className="flex flex-col gap-8 w-3/12 h-full bg-slate-50 p-6">
          {/* 프로필 */}
          <div className="w-full flex justify-between items-center gap-4">
            {/* 프로필 이미지 */}
            <div className="flex justify-center items-center rounded-full overflow-hidden border">
              <Image src={user.photoURL ?? "/user.png"} width={80} height={80} alt="user_icon" />
            </div>
            {/* 이름, 상태메시지 */}
            <div className="flex flex-col truncate">
              <div className="flex justify-start items-center">
                <p className="text-lg text-blue-500 font-semibold">{user.name}</p>
                <p className="text-lg text-gray-500 truncate">#{user.tag}</p>
              </div>
              <p className="text-sm text-gray-500 truncate">상태메시지asdasdasdasdasdaasdasdasdasdasdssdasdasds</p>
            </div>
          </div>
          <div className="w-full flex justify-around items-center">
            {/* 내정보 수정 */}
            <CustomButtonSmall
              color="blue"
              onClick={() => {
                setModalEditProfile(!modalEditProfile);
              }}
            >
              <div className="flex justify-center items-center gap-2">
                <VscEdit size={16} />
                <p>프로필 수정</p>
              </div>
            </CustomButtonSmall>

            {/* 로그아웃 */}
            <CustomButtonSmall
              color="gray"
              onClick={() => {
                signOut();
              }}
            >
              <div className="flex justify-center items-center gap-2">
                <VscUnlock size={16} />
                <p>로그아웃</p>
              </div>
            </CustomButtonSmall>
          </div>
          {/* 친구 찾기 - 아이디 검색 */}
          <input
            type="text"
            placeholder="이름#태그로 검색하기"
            className="w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            onKeyDown={(e) => {
              findHandler(e);
            }}
          />
          {/* 친구 목록 */}
          <div className="w-full h-full">
            <FriendList user={user} friends={friends} />
          </div>
        </div>
        {/* 채팅 화면 */}
        <div className="w-9/12 h-full flex flex-col bg-white px-8 pb-4">
          {/* 헤더 */}
          <div className="grow-1 border-b-2 flex justify-center items-center">
            <div className="w-full flex justify-between items-center gap-4">
              {/* 프로필 이미지 */}
              <div className="flex justify-center items-center rounded-full overflow-hidden border">
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
              <div className="flex justify-center items-center rounded-full overflow-hidden border">
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
              <div className="flex justify-center items-center rounded-full overflow-hidden border">
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

const FriendList = ({ user, friends }: { user: any; friends: any[] | null }) => {
  if (!friends) return <LoadingFriendsList />;
  // 친구 수락 핸들러
  const acceptReqHandler = async ({ uuid, tuid }: { uuid: any; tuid: any }) => {
    await acceptRequest({ uuid, tuid }).then((res) => {
      alert(res + "님과 친구가 되었습니다.");
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-scroll">
      {friends.map((item, index) => {
        const isFriendAccepted = item.friends[user.uid]?.isAccept;
        const isHost = item.friends[user.uid]?.isHost;
        const statusMessage = isFriendAccepted
          ? item.status_msg
          : isHost
          ? "친구가 되고싶어요. 저랑 친구 하실래요? 오늘도 좋은 하루 보내세요."
          : "친구만 상태메시지를 볼 수 있습니다.";

        return (
          <div key={index} className="w-full flex justify-between items-center gap-4 truncate cursor-pointer">
            {/* 프로필 이미지 */}
            <div className="flex justify-center items-center rounded-full overflow-hidden border">
              <Image src={item.photoURL || "/user.png"} width={60} height={60} alt="user_icon" />
            </div>
            {/* 이름, 상태메시지 */}
            <div className="w-full flex flex-col items-start truncate">
              <p className="text-lg text-blue-500 font-semibold">{item.name}</p>
              <p className="text-xs text-gray-500 w-full truncate">{statusMessage}</p>
            </div>
            {isFriendAccepted ? (
              // 친구 수락된 경우
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-gray-400">10:34 AM</p>
                <RoundedNumberBadge>12</RoundedNumberBadge>
              </div>
            ) : isHost ? ( // 친구 요청 중인 경우
              <CustomButtonSmall
                color="green"
                onClick={() => {
                  acceptReqHandler({ uuid: user.uid, tuid: item.uid });
                }}
              >
                수락
              </CustomButtonSmall>
            ) : (
              <Badge className="px-2 py-1">대기중</Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};
