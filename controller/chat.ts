import { db } from "@/db/firebase";
import { collection, doc, updateDoc, getDocs, getDoc, query, where, onSnapshot, setDoc, addDoc } from "firebase/firestore";
import { isTargetOnlineOnChatRoom } from "./online";

const userCollection = collection(db, "user");
const chatCollection = collection(db, "chat");
const onlineCollection = collection(db, "online");

export async function initOnline({ host }: { host: string }) {
  try {
    // 접속 시 1대1 채팅방 온라인 상태 초기화
    const onlineDocRef = doc(onlineCollection, host);
    updateDoc(onlineDocRef, { target: null });
  } catch (error) {
    console.error(error);
  }
}

export async function setOnline({ host, target }: { host: string; target: string }) {
  try {
    // 호스트 사용자와 타겟 사용자가 같은 채팅방에 있을 때 처리를 위한 로직
    // 호스트 사용자가 채팅방 들어오면 온라인으로 변경하기
    const onlineDocRef = doc(onlineCollection, host);
    updateDoc(onlineDocRef, { target: target });
  } catch (error) {
    console.error(error);
  }
}

export async function getChat({ host, target, chat_id }: { host: string; target: string; chat_id: string }, callback: (chat: any) => void) {
  try {
    setOnline({ host: host, target: target });
    // host_uid 와 target_uid로 채팅 내역 가져오기
    // 먼저 채팅방 들어오는 사람이 host가 되는 구조

    const getChat_query = query(chatCollection, where("host", "in", [host, target]), where("target", "in", [host, target]));
    const getChat_query_snapshot = await getDocs(getChat_query);

    const chatDocRef = doc(chatCollection, chat_id);
    const chat_data = getChat_query_snapshot.docs[0].data();

    // 이제 카카오톡 처럼 안읽었을 때의 "1"을 구현할거야
    // host가 채팅 방에 들어오면 sender가 host가 아닌 경우에 read가 false인걸 true로 바꿔주면 끝
    const prevChatData = chat_data.chat;
    const updatedChatRead = Object.values(prevChatData).map((value: any) => {
      if (value.sender !== host) {
        value.read = true;
      }
      return value;
    });

    // 읽지 않은 메시지 개수 초기화
    const hostDocRef = doc(userCollection, host);
    const hostDoc = await getDoc(hostDocRef);
    const hostData = hostDoc.data();

    const updatedFriendsHost = {
      ...hostData?.friends[target],
      unReadMsg: 0,
    };
    await updateDoc(hostDocRef, {
      [`friends.${target}`]: updatedFriendsHost,
    });

    // 읽었는지를 db에 저장
    await updateDoc(chatDocRef, { chat: updatedChatRead });

    return onSnapshot(chatDocRef, (chatDoc) => {
      if (chatDoc.exists()) {
        callback({ chat_id: chat_id, chat: chatDoc.data() });
      }
    });
  } catch (error) {
    console.error(error);
    return callback({});
  }
}

export async function sendChat({ uid, tuid, chatID, message }: { uid: string; tuid: string; chatID: string; message: any }) {
  try {
    const isOnline = await isTargetOnlineOnChatRoom({ uid: uid, tuid: tuid });
    // 친구 신청한 사람이 host가 되는 구조 ^_^
    // 실시간으로 채팅 데이터를 받아올거라 여기서는 db에 메시지 저장만 하자
    const chatDocRef = doc(chatCollection, chatID);
    const chatDoc = await getDoc(chatDocRef);
    const chatData = chatDoc.data();

    // 호스트, 타겟 데이터
    const HostDocRef = doc(userCollection, uid);
    const HostDoc = await getDoc(HostDocRef);
    const HostData = HostDoc.data();

    const targetDocRef = doc(userCollection, tuid);
    const targetDoc = await getDoc(targetDocRef);
    const targetData = targetDoc.data();

    let updatedMsg = message;
    // 메시지 길이 제한
    if (updatedMsg.length >= 50) {
      updatedMsg = updatedMsg.substring(0, 50);
    }

    // 채팅 데이터 저장
    const updatedChat = [{ sender: uid, message: updatedMsg, timestamp: new Date(), read: isOnline }, ...chatData?.chat];
    await updateDoc(chatDocRef, { chat: updatedChat });

    let updatedMessageSelf = {
      ...HostData?.friends[tuid],
      latestMsg: updatedMsg,
      lastMsgAt: new Date(),
    };

    let updatedMessageTarget = {
      ...targetData?.friends[uid],
      latestMsg: updatedMsg,
      lastMsgAt: new Date(),
      unReadMsg: isOnline ? 0 : targetData?.friends[uid]?.unReadMsg + 1,
    };

    await updateDoc(HostDocRef, {
      [`friends.${tuid}`]: updatedMessageSelf,
    });
    await updateDoc(targetDocRef, {
      [`friends.${uid}`]: updatedMessageTarget,
    });

    console.log("채팅 데이터가 성공적으로 저장되었습니다.");
  } catch (error) {
    console.error(error);
  }
}
