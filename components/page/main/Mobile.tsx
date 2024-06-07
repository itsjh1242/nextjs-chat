import Image from "next/image";
import { LoadingChatData, LoadingFriendsList } from "../Loading";
// ui
import { RoundedNumberBadge } from "@/components/ui/Badge";
import { CustomButton, CustomButtonSmall } from "@/components/ui/Buttons";
// modal
import { AcceptFriendRequest, EditProfile, EmojiModal, FindFriend, MobileSearch, Modal } from "@/components/ui/Modal";
import { FriendAccepted, FriendReqeusted } from "@/components/ui/Chat";

export default function Mobile({
  userData,
  isLogin,
  logout,
  chat,
  friends,
  icon,
}: {
  userData: any;
  isLogin: any;
  logout: any;
  chat: any;
  friends: any;
  icon: any;
}) {
  const user = userData.user;
  // 검색창 모달
  const searchModal = MobileSearch({ friends: { friends } });
  // 프로필 클릭 시,
  // 호스트면 내 정보 수정
  // 친구 선택 시 채팅방으로 이동
  const onClickProfileHandler = ({ isHost, target_uid }: { isHost: boolean; target_uid: string | null }) => {
    if (isHost || target_uid === null) {
      userData.setModalEditProfile(!userData.modalEditProfile);
    } else {
      chat?.targetHandler(target_uid);
    }
  };
  if (chat.target) return <Chat user={user} chat={chat} icon={icon} />;
  return (
    <main className="w-screen h-dvh flex flex-col justify-start items-center px-3 py-6">
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
      {/* 프로필 수정 모달 */}
      {userData.modalEditProfile ? (
        <EditProfile
          user={user}
          close={() => {
            userData.setModalEditProfile(!userData.modalEditProfile);
          }}
        />
      ) : null}
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
          <CustomButtonSmall className="flex justify-center items-center gap-2" color="gray" onClick={logout}>
            <icon.VscUnlock size={20} />
            <p>로그아웃</p>
          </CustomButtonSmall>
        </div>
      </div>
      {/* 내 프로필 */}
      <label className="w-full text-xs text-gray-600 mb-2">나</label>
      <Profile
        host={user}
        user={user}
        isHost={true}
        onClick={() => {
          onClickProfileHandler({ isHost: true, target_uid: null });
        }}
      />
      <div className="w-full border-b my-4" />
      {/* 친구 목록 & 채팅 */}
      <label className="w-full text-xs text-gray-600 mb-2">친구</label>
      <div className="w-full flex flex-col gap-2">
        {friends.friends?.map((item: any, index: number) => {
          return (
            <Profile
              key={index}
              host={user}
              user={item}
              isHost={false}
              onClick={() => {
                onClickProfileHandler({ isHost: false, target_uid: item.uid });
              }}
            />
          );
        })}
      </div>
    </main>
  );
}

const Chat = ({ user, chat, icon }: { user: any; chat: any; icon: any }) => {
  const chatInitHandler = () => {
    return chat.initChat();
  };
  if (!chat.chatData) return <LoadingChatData />;
  return (
    <main className="w-screen h-dvh flex flex-col justify-start items-center px-3 py-6">
      {chat.acceptFriendReq && chat.acceptFriendReqTargetName && (
        <AcceptFriendRequest targetName={chat.acceptFriendReqTargetName} close={chat.acceptFriendReqModalHandler} isMobile={true} />
      )}
      {/* 헤더 */}
      <div className="sticky w-full flex justify-start items-center gap-4 border-b pb-2 bg-white">
        <div className="flex justify-center items-center">
          <icon.VscChevronLeft
            size={40}
            onClick={() => {
              chatInitHandler();
            }}
          />
          <div className="flex justify-center items-center rounded-full overflow-hidden border">
            <Image src={chat.target.photoURL || `/user.png`} width={60} height={60} alt="user_icon" />
          </div>
        </div>
        <div className="w-full flex flex-col items-start">
          <p className="text-xl font-semibold">{chat.target.name} </p>
          <p className="text-xs text-gray-500 w-full truncate">{chat.target.status_msg}</p>
        </div>
      </div>
      {/* 채팅 박스 */}
      <div className="w-full h-screen flex flex-col-reverse gap-4 overflow-y-auto py-2">
        {Array.isArray(chat.chatData.chat) &&
          chat.chatData.chat.map((item: any, index: number) => {
            // 메시지 보내는 사람이 False가 아닌 경우에만 보여주기
            if (item.sender) {
              // 채팅 시간이 같으면 한 번만 표시하게 하장 ^_^
              var chatTime = item.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                item.message && (
                  <div key={index}>
                    {item.showDate && (
                      <div className="relative w-full flex justify-center items-center my-4">
                        <div className="absolute top-1/2 left-0 w-full border" />
                        <div className="text-gray-500 text-sm bg-white z-30 px-4">{item.showDate}</div>
                      </div>
                    )}
                    {user.uid === item.sender ? (
                      // 호스트 사용자가 보낸 메시지 - 우측표시
                      <div className="flex justify-end gap-2 items-end">
                        {/* 나 */}
                        <div className="flex flex-col items-end text-blue-300">
                          <p className="text-xs">{item.read ? "" : "1"}</p>
                          <p className="text-xs text-gray-400">{item.showTime && chatTime}</p>
                        </div>
                        <div className="max-w-72 bg-blue-500 p-3 text-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl break-all text-white">
                          <p>{item.message}</p>
                        </div>
                        <div className="flex justify-center items-center rounded-full overflow-hidden border">
                          <Image src={user.photoURL || `/user.png`} width={30} height={30} alt="user_icon" />
                        </div>
                      </div>
                    ) : (
                      // 타겟 사용자가 보낸 메시지 - 좌측 표시
                      <div className="flex gap-2 justify-start items-end">
                        {/* 상대방 */}
                        <div className="flex justify-center items-center rounded-full overflow-hidden border">
                          <Image src={chat.target.photoURL || `/user.png`} width={30} height={30} alt="user_icon" />
                        </div>
                        <div className="max-w-72 bg-slate-100 p-3 text-sm rounded-tr-xl rounded-tl-xl rounded-br-xl break-all">
                          <p>{item.message}</p>
                        </div>
                        <p className="text-xs text-gray-400">{item.showTime && chatTime}</p>
                      </div>
                    )}
                  </div>
                )
              );
            } else {
              // 보내는 사람이 False일 경우 - 친구 수락 메시지
              return <FriendAccepted key={index} />;
            }
          })}
      </div>
      {!chat.chatData.isAccept && user.uid === chat.chatData.target && (
        <FriendReqeusted onClick={() => chat.acceptReqHandler({ uuid: user.uid, tuid: chat.target.uid, chatID: chat.chatID })} />
      )}
      <div className={`w-full flex justify-center items-center pt-2 h-fit ${!chat.chatData.isAccept ? "pointer-events-none" : ""}`}>
        <div className="w-full h-fit flex justify-between items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
          <input
            type="text"
            placeholder={!chat.chatData.isAccept ? "친구가 되기 전에 채팅을 보낼 수 없어요." : "채팅을 입력하세요"}
            value={chat.msg || ""}
            onChange={(e) => {
              chat.setMsg(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                chat.sendMsg();
              }
            }}
            className="bg-transparent outline-none w-10/12"
          />
          <div className="relative flex justify-end items-center w-1/12">
            {chat.displayEmoji && <EmojiModal isMobile={true} onClick={(emoji: any) => chat.inputEmoji({ emoji: emoji, setMsg: chat.setMsg })} />}
            <icon.VscSmiley
              size={24}
              color="#6D6D6D"
              className="cursor-pointer"
              onClick={() => {
                chat.setDisplayEmoji(!chat.displayEmoji);
              }}
            />
          </div>
          <div className="flex justify-center items-center cursor-pointer p-2 rounded-full bg-blue-500">
            <icon.VscSend
              size={24}
              color="#ffffff"
              onClick={() => {
                chat.sendMsg();
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

const Profile = ({
  host,
  user,
  isHost,
  onClick,
}: {
  host?: any;
  user: any;
  isHost: boolean;
  onClick: (isHost: boolean, target_uid: string | null) => void;
}) => {
  if (!user || !host) return <LoadingFriendsList />;

  return (
    <div className="w-full flex gap-2 justify-between" onClick={() => onClick(isHost, isHost ? null : user.uid)}>
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
