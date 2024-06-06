import Image from "next/image";
import { LoadingFriendsList } from "../Loading";
// ui
import { RoundedNumberBadge } from "@/components/ui/Badge";
import { CustomButton, CustomButtonSmall } from "@/components/ui/Buttons";
// modal
import { FindFriend, MobileSearch, Modal } from "@/components/ui/Modal";

export default function Mobile({ user, isLogin, logout, chat, friends, icon }: { user: any; isLogin: any; logout: any; chat: any; friends: any; icon: any }) {
  // 검색창 모달
  const searchModal = MobileSearch({ friends: { friends } });
  return (
    <main className="w-screen min-h-screen flex flex-col justify-start items-center px-3 py-6">
      {/* 친구 검색 모달 */}
      {searchModal.show ? searchModal?.modal : null}
      {/* 친구 검색 성공 시 모달 */}
      {friends.findModal && (
        <FindFriend
          targetData={friends.targetData}
          reqSuc={friends.reqSuc}
          requestHandler={friends.requestHandler}
          close={friends.findModalHandler}
          isMobile={true}
        />
      )}
      {/* 헤더 */}
      <div className="w-full flex justify-between items-center mb-4">
        <p className="text-2xl font-semibold">채팅</p>
        <div className="flex gap-3">
          {/* 친구 찾기 */}
          <CustomButtonSmall
            className="flex justify-center items-center gap-2"
            onClick={() => {
              searchModal?.setShow(true);
            }}
          >
            <icon.VscSearch size={20} />
            <p>검색</p>
          </CustomButtonSmall>
          {/* 로그아웃 */}
          <CustomButtonSmall className="flex justify-center items-center gap-2" color="gray">
            <icon.VscUnlock size={20} />
            <p>로그아웃</p>
          </CustomButtonSmall>
        </div>
      </div>
      {/* 내 프로필 */}
      <label className="w-full text-xs text-gray-600 mb-2">나</label>
      <Profile host={user} user={user} isHost={true} />
      <div className="w-full border-b my-4" />
      {/* 친구 목록 & 채팅 */}
      <label className="w-full text-xs text-gray-600 mb-2">친구</label>
      <div className="w-full flex flex-col gap-2">
        {friends.friends?.map((item: any, index: number) => {
          return <Profile key={index} host={user} user={item} isHost={false} />;
        })}
      </div>
    </main>
  );
}

const Profile = ({ host, user, isHost }: { host?: any; user: any; isHost: boolean }) => {
  if (!user || !host) return <LoadingFriendsList />;
  return (
    <div className="w-full flex gap-2 justify-between">
      {/* 프로필 이미지 */}
      <div className="flex justify-center items-center rounded-full overflow-hidden border w-fit h-fit">
        <Image src={user.photoURL ?? "/user.png"} width={isHost ? 60 : 40} height={isHost ? 60 : 40} alt="user_icon" />
      </div>
      {/* 이름, 상태메시지 */}
      <div className="flex-1 w-full flex flex-col justify-center truncate">
        <div className={`flex items-center w-full ${!isHost && "text-xs"}`}>
          <p className={`text-blue-500 text-base`}>{user.name}</p>
          <p className="text-sm text-gray-500 truncate">#{user.tag}</p>
        </div>
        <p className="text-xs text-gray-500 w-full truncate">{isHost ? user.status_msg : host.friends[user.uid]?.latestMsg}</p>
      </div>
      {!isHost && (
        <div className="h-full flex flex-col justify-end items-end gap-1">
          <p className="text-xs text-gray-400">{host.friends[user.uid]?.lastMsgAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          {host.friends[user.uid]?.unReadMsg !== 0 && <RoundedNumberBadge color="red">{host.friends[user.uid]?.unReadMsg}</RoundedNumberBadge>}
        </div>
      )}
    </div>
  );
};
