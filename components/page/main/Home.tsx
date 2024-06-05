"use client";
import Image from "next/image";
// ui
import { NotUser, NoChat } from "../Not";
import { Loading, LoadingChatData, LoadingFriendsList } from "../Loading";
import { RoundedNumberBadge } from "@/components/ui/Badge";
import { CustomButtonSmall } from "@/components/ui/Buttons";
import { FriendReqeusted, FriendAccepted } from "@/components/ui/Chat";
// icons
import { VscSmiley, VscSend, VscUnlock, VscEdit } from "react-icons/vsc";
import { AcceptFriendRequest, EditProfile, EmojiModal, FindFriend } from "../../ui/Modal";
import useFriends from "@/lib/useFriends";
import useChat from "@/lib/useChat";

export default function HomePage({ userData, isLogin, logout }: { userData: any; isLogin: any; logout: any }) {
  const user = userData.user;
  // 실시간 친구 목록
  const friends = useFriends({ user: user });
  // 실시간 채팅 데이터
  const chat = useChat({ user: user });

  if (!isLogin) return <NotUser />;
  if (!user) return <Loading />;

  return (
    <main className="w-screen h-screen m-auto p-12 bg-slate-600">
      {userData.modalEditProfile ? (
        <EditProfile
          user={user}
          close={() => {
            userData.setModalEditProfile(!userData.modalEditProfile);
          }}
        />
      ) : null}
      <div className="flex w-full h-full rounded-xl overflow-hidden">
        {/* 메뉴 */}
        <Menu
          user={user}
          friends={friends}
          logout={logout}
          targetHandler={(target_uid: any) => {
            chat?.targetHandler(target_uid);
          }}
          modalHandler={() => {
            userData.setModalEditProfile(!userData.modalEditProfile);
          }}
        />
        {/* 채팅 화면 */}
        <Chat user={user} chat={chat} />
      </div>
    </main>
  );
}

const Menu = ({
  user,
  friends,
  logout,
  targetHandler,
  modalHandler,
}: {
  user: any;
  friends: any;
  logout: (uid: string) => void;
  targetHandler: (target_uid: any) => void;
  modalHandler: () => void;
}) => {
  return (
    <>
      {friends.findModal && (
        <FindFriend targetData={friends.targetData} reqSuc={friends.reqSuc} requestHandler={friends.requestHandler} close={friends.findModalHandler} />
      )}
      {/* 메뉴 */}
      <div className="flex flex-col gap-4 w-3/12 h-full bg-slate-50 p-3 truncate">
        {/* 프로필 */}
        <div className="w-full flex justify-between items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="flex justify-center items-center rounded-full overflow-hidden border">
            <Image src={user.photoURL ?? "/user.png"} width={80} height={80} alt="user_icon" />
          </div>
          {/* 이름, 상태메시지 */}
          <div className="flex flex-col w-full truncate">
            <div className="flex justify-start items-center">
              <p className="text-lg text-blue-500 font-semibold">{user.name}</p>
              <p className="text-lg text-gray-500 truncate">#{user.tag}</p>
            </div>
            <p className="text-sm text-gray-500 truncate">{user.status_msg}</p>
          </div>
        </div>
        <div className="w-full flex justify-around items-center border-b pb-4">
          {/* 내정보 수정 */}
          <CustomButtonSmall color="blue" onClick={modalHandler}>
            <div className="flex justify-center items-center gap-2">
              <VscEdit size={16} />
              <p>프로필 수정</p>
            </div>
          </CustomButtonSmall>

          {/* 로그아웃 */}
          <CustomButtonSmall
            color="gray"
            onClick={() => {
              logout(user.uid);
            }}
          >
            <div className="flex justify-center items-center gap-2">
              <VscUnlock size={16} />
              <p>로그아웃</p>
            </div>
          </CustomButtonSmall>
        </div>
        {/* 친구 찾기 - 아이디 검색 */}
        <div className="flex flex-col gap-2 border-b pb-4">
          <label className="text-xs font-semibold text-gray-600 pl-2">친구 찾기</label>
          <div className="flex gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="닉네임"
                value={friends.findName || ""}
                className="w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                onChange={(e) => {
                  friends.setFindName(e.target.value);
                }}
              />
              <input
                type="text"
                placeholder="태그"
                value={friends.findTag || ""}
                className="w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                onChange={(e) => {
                  friends.setFindTag(e.target.value);
                }}
              />
            </div>
            <CustomButtonSmall
              onClick={() => {
                friends.findHandler();
              }}
            >
              검색
            </CustomButtonSmall>
          </div>
        </div>

        {/* 친구 목록 */}
        <label className="text-xs font-semibold text-gray-600 pl-2">친구 목록</label>
        <div className="w-full h-full overflow-y-scroll">
          <FriendList
            user={user}
            friends={friends}
            targetHandler={(target_uid: any) => {
              targetHandler(target_uid);
            }}
          />
        </div>
      </div>
    </>
  );
};

const FriendList = ({ user, friends, targetHandler }: { user: any; friends: any | null; targetHandler: (target_uid: any) => void }) => {
  if (!friends.friends) return <LoadingFriendsList />;

  return (
    <div className="w-full flex flex-col gap-4 overflow-y-scroll">
      {friends.friends.map((item: any, index: number) => (
        <div
          key={index}
          className="flex items-center gap-2 truncate cursor-pointer"
          onClick={() => {
            targetHandler(item.uid);
          }}
        >
          <div className="flex justify-center items-center rounded-full overflow-hidden border">
            <Image src={item.photoURL || "/user.png"} width={60} height={60} alt="user_icon" />
          </div>
          <div className="w-full flex flex-col truncate">
            <div className="flex items-center w-full">
              <p className="text-blue-500 ">{item.name}</p>
              <p className="text-sm text-gray-500 truncate">#{item.tag}</p>
            </div>
            <p className="text-xs text-gray-500 w-full truncate">{user.friends[item.uid]?.latestMsg}</p>
          </div>
          <div className="h-full flex flex-col items-end gap-1">
            {user.friends[item.uid]?.unReadMsg !== 0 && <RoundedNumberBadge>{user.friends[item.uid]?.unReadMsg}</RoundedNumberBadge>}
            <p className="text-xs text-gray-400">
              {user.friends[item.uid]?.lastMsgAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Chat = ({ user, chat }: { user: any; chat: any }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white p-4">
      {!chat.target ? (
        <NoChat />
      ) : !chat.chatData ? (
        <LoadingChatData />
      ) : (
        <>
          {chat.acceptFriendReq && chat.acceptFriendReqTargetName && (
            <AcceptFriendRequest targetName={chat.acceptFriendReqTargetName} close={chat.acceptFriendReqModalHandler} />
          )}
          {/* 헤더 */}
          <div className="flex justify-start items-center gap-4 border-b pb-2">
            <div className="flex justify-center items-center rounded-full overflow-hidden border">
              <Image src={chat.target.photoURL || `/user.png`} width={60} height={60} alt="user_icon" />
            </div>
            <div className="w-full flex flex-col items-start">
              <p className="text-xl font-semibold">{chat.target.name} </p>
              <p className="text-xs text-gray-500 w-full truncate">{chat.target.status_msg}</p>
            </div>
          </div>
          {/* 채팅 박스 */}
          <div className="h-full flex flex-col-reverse gap-4 overflow-y-auto py-2">
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
                            <p className="max-w-half bg-blue-500 text-white px-4 py-2 text-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl">{item.message}</p>
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
                            <p className="max-w-half bg-slate-100 px-4 py-2 text-sm rounded-tr-xl rounded-tl-xl rounded-br-xl">{item.message}</p>
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
          <div className={`flex justify-center items-center pt-2 h-fit ${!chat.chatData.isAccept ? "pointer-events-none" : ""}`}>
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
                {chat.displayEmoji && <EmojiModal onClick={(emoji: any) => chat.inputEmoji({ emoji: emoji, setMsg: chat.setMsg })} />}
                <VscSmiley
                  size={24}
                  color="#6D6D6D"
                  className="cursor-pointer"
                  onClick={() => {
                    chat.setDisplayEmoji(!chat.displayEmoji);
                  }}
                />
              </div>
              <div className="flex justify-center items-center cursor-pointer p-2 rounded-full bg-blue-500">
                <VscSend
                  size={24}
                  color="#ffffff"
                  onClick={() => {
                    chat.sendMsg();
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
