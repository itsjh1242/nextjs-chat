import Image from "next/image";
import { LoadingFriendsList } from "../Loading";
import { RoundedNumberBadge } from "@/components/ui/Badge";
export default function Mobile({ user, isLogin, logout, chat, friends, icon }: { user: any; isLogin: any; logout: any; chat: any; friends: any; icon: any }) {
  return (
    <main className="w-screen min-h-screen flex flex-col justify-start items-center px-3 py-6">
      {/* 헤더 */}
      <div className="w-full flex justify-between items-center mb-4">
        <p className="text-2xl font-semibold">채팅</p>
        <div className="flex gap-3">
          {/* 친구 찾기 */}
          <div>
            <icon.VscSearch size={24} />
          </div>
          {/* 내정보 수정 */}
          <div>
            <icon.VscEdit size={24} />
          </div>
          {/* 로그아웃 */}
          <div>
            <icon.VscUnlock size={24} />
          </div>
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
