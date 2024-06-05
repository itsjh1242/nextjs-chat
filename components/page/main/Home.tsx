"use client";
import { useState, useEffect } from "react";

import { acceptRequest, getFriends, getUserByNameTag, getUserByUid, requestFriend } from "@/controller/user";
import Image from "next/image";
import useDevice from "@/lib/useDevice";
import { useAuth } from "@/lib/useAuth";
import { signOut } from "@/db/firebase";
import { getChat, initOnline, sendChat } from "@/controller/chat";
// ui
import Mobile from "./Mobile";
import { NotUser, NotFriend, NoChat } from "../Not";
import { Loading, LoadingChatData, LoadingFriendsList } from "../Loading";
import { Badge, RoundedNumberBadge } from "@/components/ui/Badge";
import { CustomButtonSmall } from "@/components/ui/Buttons";
import { FriendReqeusted, FriendAccepted } from "@/components/ui/Chat";

// icons
import { VscSmiley, VscSend, VscUnlock, VscEdit } from "react-icons/vsc";
import { AcceptFriendRequest, EditProfile, EmojiModal, FindFriend } from "../../ui/Modal";

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

  const handleTarget = async (t: any) => {
    await initOnline({ host: user.uid });
    await getUserByUid({ uid: t }).then((res) => {
      setTarget(res);
      setChatID(res?.friends[user.uid].chat_id);
    });
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
      const unsubscribe = await getFriends({ uid: user.uid }, handleFriendsUpdate);
      console.log("fetchFriends");
      if (unsubscribe) {
        return () => unsubscribe();
      }
    };

    fetchFriends();
  }, [user, chat_id]);

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
          handleTarget={(target: any) => {
            handleTarget(target);
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

const Menu = ({ user, friends, handleTarget, modalHandler }: { user: any; friends: any; handleTarget: (target: any) => void; modalHandler: () => void }) => {
  // 친구 찾기 - 이름, 태그 이벤트 발생 핸들
  const [findName, setFindName] = useState<string | null>(null);
  const [findTag, setFindTag] = useState<string | null>(null);

  // 친구 검색 시 모달창 핸들 && 핸들러
  const [findModal, setFindModal] = useState<boolean>(false);
  const findModalHandler = () => {
    return setFindModal(!findModal);
  };
  // 검색한 사용자 정보
  const [targetData, setTargetData] = useState<any | null>(null);
  // 검색한 사용자에게 친구 요청을 보냈을 때 모달 핸들
  const [reqSuc, setReqSuc] = useState<boolean>(false);

  // 친구 찾기 핸들러
  const findHandler = async () => {
    if (findName && findTag) {
      const res = await getUserByNameTag({ uid: user.uid, target: [findName, findTag] });
      switch (res?.msg) {
        case "ERR_NOT_USER":
          return alert("그런 사람은 없습니다.");
        case "ERR_ALREADY_REQ":
          return alert("이미 친구요청을 보냈습니다. 기다려보세요.");
        case "ERR_ALREADY_FRIENDS":
          return alert("두 분은 이미 친구네요.");
        case "ERR_SELF":
          return alert("자기 자신에게 친구 요청을 보내셨나요...?");
        case "SUC_FIND":
          setTargetData(res.target);
          setFindModal(true);
          setFindName("");
          setFindTag("");
          return true;
        default:
          return alert("ERR!");
      }
    } else {
      return alert("닉네임과 태그를 모두 입력해주세요.");
    }
  };

  // 친구 요청 핸들러
  const requestHandler = async () => {
    if (targetData) {
      const res = await requestFriend({ uid: user.uid, tuid: targetData.uid });
      if (res) {
        return setReqSuc(!reqSuc);
      }
    } else {
      return alert("일시적인 에러가 발생했답니다.");
    }
  };

  // 로그아웃 핸들러
  const handleLogOut = (uid: string) => {
    initOnline({ host: uid }).then(() => {
      signOut();
    });
  };

  return (
    <>
      {findModal && <FindFriend targetData={targetData} reqSuc={reqSuc} requestHandler={requestHandler} close={findModalHandler} />}
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
        <div className="flex flex-col gap-2 border-b pb-4">
          <label className="text-xs font-semibold text-gray-600 pl-2">친구 찾기</label>
          <div className="flex gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="닉네임"
                value={findName || ""}
                className="w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                onChange={(e) => {
                  setFindName(e.target.value);
                }}
              />
              <input
                type="text"
                placeholder="태그"
                value={findTag || ""}
                className="w-full px-3 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                onChange={(e) => {
                  setFindTag(e.target.value);
                }}
              />
            </div>
            <CustomButtonSmall
              onClick={() => {
                findHandler();
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
            handleTarget={(target: any) => {
              handleTarget(target);
            }}
          />
        </div>
      </div>
    </>
  );
};

const FriendList = ({ user, friends, handleTarget }: { user: any; friends: any[] | null; handleTarget: (target: any) => void }) => {
  const [friendsData, setFriendsData] = useState<any[] | null>(null);

  useEffect(() => {
    setFriendsData(friends);
  }, [friends]);

  if (!friendsData) return <LoadingFriendsList />;

  return (
    <div className="w-full flex flex-col gap-4 overflow-y-scroll">
      {friendsData.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 truncate cursor-pointer"
          onClick={() => {
            handleTarget(item.uid);
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

const Chat = ({ user, target, chat_id }: { user: any; target: any | null; chat_id: string | null }) => {
  // 채팅 데이터 동기화
  const [chatData, setChatData] = useState<any | null>(null);

  // 친구요청 수락 시 모달에 타겟 이름, 태그 핸들
  const [acceptFriendReq, setAcceptFriendReq] = useState<boolean>(false);
  const [acceptFriendReqTargetName, setAcceptFriendReqTargetName] = useState<string[] | null>(null);
  const acceptFriendReqModalHandler = () => {
    setAcceptFriendReq(!acceptFriendReq);
  };
  const acceptReqHandler = async ({ uuid, tuid, chat_id }: { uuid: any; tuid: any; chat_id: string }) => {
    try {
      const res = await acceptRequest({ uuid, tuid, chat_id });
      if (res) {
        setAcceptFriendReqTargetName([res?.name, res?.tag]);
        acceptFriendReqModalHandler();
      }
    } catch (error) {
      console.error("친구 요청 수락 중 오류 발생:", error);
    }
  };

  // 현재 입력창에 입력된 메시지 핸들
  const [msg, setMsg] = useState<string | null>(null);
  // 이모티콘 상자 디스플레이 핸들
  const [displayEmoji, setDisplayEmoji] = useState<boolean>(false);

  // target이 정해지면 채팅 내역을 가져오자
  useEffect(() => {
    if (!target || !target.friends) return;
    const handleChat = (chat: any) => {
      let lastMsgDate: string | null = null;

      const updatedChat = chat.chat.chat.reverse().map((item: any) => {
        const itemMsgDate = item.timestamp?.toDate().toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const showDate = (lastMsgDate === null || lastMsgDate !== itemMsgDate) && item.sender !== false;
        lastMsgDate = itemMsgDate;

        return { ...item, showDate: showDate ? itemMsgDate : false };
      });

      chat.chat.chat = updatedChat.reverse();

      setChatData(chat.chat || null);
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

  // 이모티콘 입력 창에 삽입 핸들러
  const inputEmoji = (emoji: any) => {
    setMsg((prev) => (prev || "") + emoji);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white p-4">
      {!target ? (
        <NoChat />
      ) : !chatData ? (
        <LoadingChatData />
      ) : (
        <>
          {acceptFriendReq && acceptFriendReqTargetName && <AcceptFriendRequest targetName={acceptFriendReqTargetName} close={acceptFriendReqModalHandler} />}
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
            {Array.isArray(chatData.chat) &&
              chatData.chat.map((item: any, index: number) => {
                // 메시지 보내는 사람이 False가 아닌 경우에만 보여주기
                if (item.sender) {
                  // 채팅 시간이 같으면 한 번만 표시하게 하장 ^_^
                  var chatTime = item.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
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
                            <p className="text-xs text-gray-400">{chatTime}</p>
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
                            <Image src={target.photoURL || `/user.png`} width={30} height={30} alt="user_icon" />
                          </div>
                          <p className="max-w-half bg-slate-100 px-4 py-2 text-sm rounded-tr-xl rounded-tl-xl rounded-br-xl">{item.message}</p>
                          <p className="text-xs text-gray-400">{chatTime}</p>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // 보내는 사람이 False일 경우 - 친구 수락 메시지
                  return <FriendAccepted key={index} />;
                }
              })}
          </div>
          {!chatData.isAccept && user.uid === chatData.target && (
            <FriendReqeusted onClick={() => acceptReqHandler({ uuid: user.uid, tuid: target.uid, chat_id: chatData.chat_id })} />
          )}
          <div className={`flex justify-center items-center pt-2 h-fit border-t-2 ${!chatData.isAccept ? "pointer-events-none" : ""}`}>
            <div className="w-full h-fit flex justify-between items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <input
                type="text"
                placeholder={!chatData.isAccept ? "친구가 되기 전에 채팅을 보낼 수 없어요." : "채팅을 입력하세요"}
                value={msg || ""}
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMsg();
                  }
                }}
                className="bg-transparent outline-none w-10/12"
              />
              <div className="relative flex justify-end items-center w-1/12">
                {displayEmoji && <EmojiModal onClick={(emoji: any) => inputEmoji(emoji)} />}
                <VscSmiley
                  size={24}
                  color="#6D6D6D"
                  className="cursor-pointer"
                  onClick={() => {
                    setDisplayEmoji(!displayEmoji);
                  }}
                />
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
