import { db } from "@/db/firebase";
import { collection, doc, updateDoc, getDocs, getDoc, query, where, onSnapshot, setDoc, addDoc } from "firebase/firestore";

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

export async function IsBothOnline({ host, target }: { host: string; target: string }) {
  try {
    const onlineHostDocRef = doc(onlineCollection, host);
    const onlineTargetDocRef = doc(onlineCollection, target);

    const onlineHostDoc = await getDoc(onlineHostDocRef);
    const onlineTargetDoc = await getDoc(onlineTargetDocRef);

    if (onlineHostDoc.data()?.target === target && onlineTargetDoc.data()?.target === host) {
      return true;
    } else {
      return false;
    }
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

export async function sendChat({ host, target, chat_id, message }: { host: string; target: string; chat_id: string; message: any }) {
  try {
    // 친구 신청한 사람이 host가 되는 구조 ^_^
    // 실시간으로 채팅 데이터를 받아올거라 여기서는 db에 메시지 저장만 하자
    const chatDocRef = doc(chatCollection, chat_id);
    const chatDoc = await getDoc(chatDocRef);
    const chatData = chatDoc.data();

    let read = false;
    const onlineDocRef = doc(onlineCollection, target);
    const onlineDoc = await getDoc(onlineDocRef);
    const onlineData = onlineDoc.data();

    // 읽지 않은 메시지 개수 가져오기
    const targetDocRef = doc(userCollection, target);
    const targetDoc = await getDoc(targetDocRef);
    const targetData = targetDoc.data();

    // 상대방이 내 채팅방에 접속 중이면 read 상태 true로 변경
    if (onlineData?.target === host) {
      read = true;
    } else {
      // 상대방이 내 채팅방에 접속 중이지 않으면 read를 false 그대로 유지하고,
      // 상대방: 읽지 않은 메시지 개수 추가
      const updatedFriendsHost = {
        ...targetData?.friends[host],
        unReadMsg: (targetData?.friends[host]?.unReadMsg || 0) + 1,
      };
      await updateDoc(targetDocRef, {
        [`friends.${host}`]: updatedFriendsHost,
      });
    }

    // 현재 채팅방의 가장 최근 메시지를 저장

    const updatedChat = [{ sender: host, message: message, timestamp: new Date(), read: read }, ...chatData?.chat];
    await updateDoc(chatDocRef, { chat: updatedChat });
  } catch (error) {
    console.error(error);
  }
}
