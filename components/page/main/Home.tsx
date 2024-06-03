"use client";
import { useState, useEffect } from "react";

import { acceptRequest, getFriends, requestFriend } from "@/controller/user";
import Image from "next/image";
import useDevice from "@/lib/useDevice";
import { useAuth, useLeaveObserver } from "@/lib/useAuth";
import { signOut } from "@/db/firebase";

// ui
import Mobile from "./Mobile";
import { NotUser, NotFriend, NoChat } from "../Not";
import { Loading, LoadingChatData, LoadingFriendsList } from "../Loading";
import { Badge, RoundedNumberBadge } from "@/components/ui/Badge";
import { CustomButtonSmall } from "@/components/ui/Buttons";

import { getChat, initOnline, sendChat } from "@/controller/chat";

// icons
import { VscSmiley, VscSend, VscUnlock, VscEdit } from "react-icons/vsc";
import { EditProfile } from "./Modal";

export default function HomePage({ user }: { user: any }) {
  const isLogin = useAuth();
  const mobile = useDevice();

  // 친구 목록 제어 핸들
  const [friends, setFriends] = useState<any[] | null>(null);
  // 프로필 수정 모달 제어 핸들
  const [modalEditProfile, setModalEditProfile] = useState<boolean>(false);
  // 채팅 대상 핸들
  const [target, setTarget] = useState<any | null>(null);
  // 채팅방 핸들
  const [chat_id, setChatID] = useState<string | null>(null);

  const handleTarget = (target: any, chat_id: string) => {
    setTarget(target);
    setChatID(chat_id);
  };

  // 친구 목록 실시간 업데이트
  useEffect(() => {
    if (!user) return;

    // 친구 목록 업데이트 함수
    const handleFriendsUpdate = (updatedFriends: any[]) => {
      setFriends(updatedFriends);
    };
    // 친구 목록을 가져오고 실시간 업데이트
    const fetchFriends = async () => {
      const unsubscribe = await getFriends({ uid: user.uid, chat_id: chat_id || "" }, handleFriendsUpdate);
      console.log("fetchFriends");
      if (unsubscribe) {
        return () => unsubscribe();
      }
    };

    fetchFriends();
  }, [user, chat_id]);

  useLeaveObserver(user.uid);

  if (!isLogin) return <NotUser />;
  if (!user) return <Loading />;
  if (mobile) return <Mobile />;

  return (
    <main className="w-screen h-screen m-auto p-12 bg-slate-600">
      {modalEditProfile ? (
        <EditProfile
          user={user}
          close={() => {
            setModalEditProfile(!modalEditProfile);
          }}
        />
      ) : null}
      <div className="flex w-full h-full rounded-xl overflow-hidden">
        {/* 메뉴 */}
        <Menu
          user={user}
          friends={friends}
          handleTarget={(target: any, chat_id: string) => {
            handleTarget(target, chat_id);
          }}
          modalHandler={() => {
            setModalEditProfile(!modalEditProfile);
          }}
        />
        {/* 채팅 화면 */}
        <Chat user={user} target={target} chat_id={chat_id} />
      </div>
    </main>
  );
}

const Menu = ({
  user,
  friends,
  handleTarget,
  modalHandler,
}: {
  user: any;
  friends: any;
  handleTarget: (target: any, chat_id: string) => void;
  modalHandler: () => void;
}) => {
  // 로그아웃 핸들러
  const handleLogOut = (uid: string) => {
    initOnline({ host: uid }).then(() => {
      signOut();
    });
  };
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
  return (
    <>
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
        <div className="w-full flex justify-around items-center">
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
              handleLogOut(user.uid);
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
        <div className="w-full h-full overflow-hidden">
          <FriendList
            user={user}
            friends={friends}
            handleTarget={(target: any, chat_id: string) => {
              handleTarget(target, chat_id);
            }}
          />
        </div>
      </div>
    </>
  );
};

const FriendList = ({ user, friends, handleTarget }: { user: any; friends: any[] | null; handleTarget: (target: any, chat_id: string) => void }) => {
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
        const isHost = !item.friends[user.uid]?.isHost;
        const statusMessage = isFriendAccepted
          ? item.status_msg
          : isHost
          ? "친구가 되고싶어요. 저랑 친구 하실래요? 오늘도 좋은 하루 보내세요."
          : "친구만 상태메시지를 볼 수 있습니다.";

        return (
          <div
            key={index}
            className="w-full flex justify-between items-center gap-2 truncate cursor-pointer"
            onClick={() => {
              handleTarget(item, item.friends[user.uid]?.chat_id);
            }}
          >
            {/* 프로필 이미지 */}
            <div className="flex justify-center items-center rounded-full overflow-hidden border">
              <Image src={item.photoURL || "/user.png"} width={60} height={60} alt="user_icon" />
            </div>
            {/* 이름, 상태메시지 */}
            <div className="w-full flex flex-col items-start truncate">
              <div className="flex items-center w-full">
                <p className="text-sm text-blue-500 ">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">#{item.tag}</p>
              </div>
              <p className="text-xs text-gray-500 w-full truncate">{statusMessage}</p>
            </div>
            {isFriendAccepted ? (
              // 친구 수락된 경우
              <div className="flex flex-col items-end gap-2">
                {/* <p className="text-xs text-gray-400">10:34 AM</p> */}
                {/* 읽지 않은 메시지 */}
                <RoundedNumberBadge>
                  <p className="text-xs">{user.friends[item.uid]?.unReadMsg}</p>
                </RoundedNumberBadge>
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

const Chat = ({ user, target, chat_id }: { user: any; target: any | null; chat_id: string | null }) => {
  const [chatData, setChatData] = useState<any | null>(null);
  let hostPrevChatTime = "";
  let targetPrevChatTime = "";

  const [msg, setMsg] = useState<string | null>(null);

  // target이 정해지면 채팅 내역을 가져오자
  useEffect(() => {
    if (!target || !target.friends || !target.friends[user.uid]?.isAccept) return;
    console.log("타겟", target);
    const handleChat = (chat: any) => {
      setChatData(chat.chat.chat || null);
    };

    const fetchChat = async () => {
      setChatData(null);
      if (chat_id) {
        const unsubscribe = await getChat({ host: user.uid, target: target.uid, chat_id: chat_id }, handleChat);
        console.log("fetchChat");
        if (unsubscribe) {
          return unsubscribe;
        }
      }
      return () => {};
    };

    let unsubscribe: () => void = () => {};

    fetchChat().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chat_id, target, user.uid]);

  // 메시지 전송 핸들러
  const sendMsg = async () => {
    if (!msg || msg === "") {
      return alert("메시지 내용을 입력해주세요.");
    }
    if (chat_id) {
      await sendChat({ host: user.uid, target: target.uid, chat_id: chat_id, message: msg });
    } else {
      return alert("오잉, 일시적인 오류입니다. 다시 시도해주세요.");
    }
    setMsg("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-white p-4">
      {!target ? (
        <NoChat />
      ) : !target?.friends[user.uid].isAccept ? (
        <NotFriend />
      ) : !chatData ? (
        <LoadingChatData />
      ) : (
        <>
          {/* 헤더 */}
          <div className="flex justify-start items-center gap-4 border-b pb-2">
            <div className="flex justify-center items-center rounded-full overflow-hidden border">
              <Image src={target.photoURL || `/user.png`} width={60} height={60} alt="user_icon" />
            </div>
            <div className="w-full flex flex-col items-start">
              <p className="text-xl font-semibold">{target.name} </p>
              <p className="text-xs text-gray-500 w-full truncate">{target.status_msg}</p>
            </div>
          </div>
          {/* 채팅 박스 */}
          <div className="h-full flex flex-col-reverse gap-4 overflow-y-auto py-2">
            {Array.isArray(chatData) &&
              chatData.map((item: any, index: number) => {
                // 채팅 시간이 같으면 한 번만 표시하게 하장 ^_^
                var chatTime = item.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                if (user.uid === item.sender) {
                  if (chatTime === hostPrevChatTime) {
                    chatTime = "";
                  } else {
                    hostPrevChatTime = chatTime;
                  }
                  return (
                    <div key={index} className="flex justify-end gap-2 items-end">
                      {/* 나 */}
                      <div className="flex flex-col items-end text-blue-300">
                        <p className="text-xs">{item.read ? "" : "1"}</p>
                        <p className="text-xs text-gray-400">{chatTime}</p>
                      </div>
                      <p className="max-w-half bg-blue-500 text-white px-4 py-2 text-sm rounded-tl-xl rounded-tr-xl rounded-bl-xl">{item.message}</p>
                      <div className="flex justify-center items-center rounded-full overflow-hidden border">
                        <Image src={user.photoURL || `/user.png`} width={30} height={30} alt="user_icon" />
                      </div>
                    </div>
                  );
                } else {
                  if (chatTime === targetPrevChatTime) {
                    chatTime = "";
                  } else {
                    targetPrevChatTime = chatTime;
                  }
                  return (
                    <div key={index} className="flex gap-2 justify-start items-end">
                      {/* 상대방 */}
                      <div className="flex justify-center items-center rounded-full overflow-hidden border">
                        <Image src={target.photoURL || `/user.png`} width={30} height={30} alt="user_icon" />
                      </div>
                      <p className="max-w-half bg-slate-100 px-4 py-2 text-sm rounded-tr-xl rounded-tl-xl rounded-br-xl">{item.message}</p>
                      <p className="text-xs text-gray-400">{chatTime}</p>
                    </div>
                  );
                }
              })}
          </div>
          <div className="flex justify-center items-center pt-2 h-fit border-t-2">
            <div className="w-full h-fit flex justify-between items-center gap-2 rounded-full bg-slate-200 px-4 py-2">
              <input
                type="text"
                placeholder="채팅을 입력하세요"
                value={msg || ""}
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
                className="bg-transparent outline-none w-10/12"
              />
              <div className="flex justify-end items-center w-1/12">
                <VscSmiley size={24} color="#6D6D6D" className="cursor-pointer" />
              </div>
              <div className="flex justify-center items-center cursor-pointer p-2 rounded-full bg-blue-500">
                <VscSend
                  size={24}
                  color="#ffffff"
                  onClick={() => {
                    sendMsg();
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
