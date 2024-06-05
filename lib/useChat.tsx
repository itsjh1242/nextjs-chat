import { getChat, initOnline, sendChat } from "@/controller/chat";
import { acceptRequest, getUserByUid } from "@/controller/user";
import { useEffect, useState } from "react";

export default function useChat({ user }: { user: any }) {
  // 현재 입력창에 입력된 메시지 핸들
  const [msg, setMsg] = useState<string | null>(null);
  // 이모티콘 상자 디스플레이 핸들
  const [displayEmoji, setDisplayEmoji] = useState<boolean>(false);
  // 채팅 대상
  const [target, setTarget] = useState<any | null>(null);
  // 채팅 데이터
  const [chatData, setChatData] = useState<any | null>(null);
  // 채팅방 아이디
  const [chatID, setChatID] = useState<string | null>(null);
  // 친구요청 수락 시 모달에 타겟 이름, 태그 핸들
  const [acceptFriendReq, setAcceptFriendReq] = useState<boolean>(false);
  const [acceptFriendReqTargetName, setAcceptFriendReqTargetName] = useState<string[] | null>(null);

  // target이 정해지면 채팅 내역을 가져오자
  useEffect(() => {
    if (!target || !target.friends || !user) return;

    const handleChat = (chat: any) => {
      if (!chat) return;
      let lastMsgDate: string | null = null;
      let lastMsgTimeHost: string | null = null;
      let lastMsgTimeTarget: string | null = null;

      const updatedMsgTime = chat.chat.chat.map((item: any) => {
        let newChat: any | null = null;
        const itemMsgTime = item.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (item.sender === user.uid) {
          newChat = { ...item, showTime: lastMsgTimeHost === null || lastMsgTimeHost !== itemMsgTime };
          lastMsgTimeHost = itemMsgTime;
        } else {
          newChat = { ...item, showTime: lastMsgTimeTarget === null || lastMsgTimeTarget !== itemMsgTime };
          lastMsgTimeTarget = itemMsgTime;
        }
        return newChat;
      });

      const updatedMsg = updatedMsgTime.reverse().map((item: any) => {
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
      chat.chat.chat = updatedMsg.reverse();
      setChatData(chat.chat || null);
    };

    const fetchChat = async () => {
      if (chatID) {
        const unsubscribe = await getChat({ host: user.uid, target: target.uid, chat_id: chatID }, handleChat);
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
  }, [chatID, target, user]);

  const targetHandler = async (target_uid: any) => {
    await initOnline({ host: user.uid });
    await getUserByUid({ uid: target_uid }).then((res) => {
      setTarget(res);
      setChatID(res?.friends[user.uid].chat_id);
    });
  };

  // 메시지 전송 핸들러
  const sendMsg = async () => {
    if (!msg || msg === "") {
      return alert("메시지 내용을 입력해주세요.");
    }
    if (chatID) {
      await sendChat({ uid: user.uid, tuid: target.uid, chatID: chatID, message: msg });
    } else {
      return alert("오잉, 일시적인 오류입니다. 다시 시도해주세요.");
    }
    setMsg("");
  };

  // 이모티콘 입력 창에 삽입 핸들러
  const inputEmoji = ({ emoji }: { emoji: any }) => {
    setMsg((prev) => (prev || "") + emoji);
  };

  // 친구 수락시 모달 디스플레이
  const acceptFriendReqModalHandler = () => {
    setAcceptFriendReq(!acceptFriendReq);
  };

  const acceptReqHandler = async () => {
    try {
      if (chatID) {
        const res = await acceptRequest({ uid: user.uid, tuid: target.uid, chatID: chatID });
        if (res) {
          setAcceptFriendReqTargetName([res?.name, res?.tag]);
          acceptFriendReqModalHandler();
        }
      }
    } catch (error) {
      console.error("친구 요청 수락 중 오류 발생:", error);
    }
  };
  return {
    target: target,
    chatData: chatData,
    chatID: chatID,
    targetHandler: targetHandler,
    msg: msg,
    setMsg: setMsg,
    displayEmoji: displayEmoji,
    setDisplayEmoji: setDisplayEmoji,
    sendMsg: sendMsg,
    inputEmoji: inputEmoji,
    acceptFriendReqModalHandler: acceptFriendReqModalHandler,
    acceptReqHandler: acceptReqHandler,
    acceptFriendReq: acceptFriendReq,
    acceptFriendReqTargetName: acceptFriendReqTargetName,
  };
}
