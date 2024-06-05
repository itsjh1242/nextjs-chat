import { db, auth } from "@/db/firebase";
import { collection, doc, updateDoc, addDoc, getDocs, getDoc, query, where, onSnapshot } from "firebase/firestore";
import { isTargetOnlineOnChatRoom } from "./online";

const userCollection = collection(db, "user");
const chatCollection = collection(db, "chat");

// 사용자 정보 가져오기
export async function getUser(callback: (user: any) => void) {
  try {
    const userDocRef = doc(userCollection, auth.currentUser?.uid);
    return onSnapshot(userDocRef, (userDoc) => {
      if (userDoc.exists()) {
        callback(userDoc.data());
      }
    });
  } catch (error) {
    console.error("user.ts, getUser() ERR: ", error);
  }
}

// uid로 사용자 정보 가져오기
export async function getUserByUid({ uid }: { uid: string }) {
  try {
    const userDocRef = doc(userCollection, uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("user.ts, getUserByUid() ERR: ", error);
    return null;
  }
}

export async function getUserByNameTag({ uid, target }: { uid: string; target: string[] }) {
  try {
    // 등록하려는 사용자 db 조회 (이름과 태그로 조회)
    const [name, tag] = target;
    const q = query(userCollection, where("name", "==", name), where("tag", "==", tag));
    const querySnapshot = await getDocs(q);
    const tuid = querySnapshot.docs[0]?.id;
    // 요청을 보낼 대상이 db에 존재하지 않을 때
    if (querySnapshot.size === 0) {
      return { status: false, msg: "ERR_NOT_USER" };
    }
    // 자기 자신에게 보내는 경우
    if (uid === tuid) {
      return { status: false, msg: "ERR_SELF" };
    }

    const hostDocRef = doc(userCollection, uid);
    const hostDoc = await getDoc(hostDocRef);
    const hostData = hostDoc.data();

    // 이미 요청을 보낸 대상인지 조회 &&  이미 친구인지 확인
    const hostFriends = hostData?.friends;

    if (hostFriends && hostFriends[tuid] && !hostFriends[tuid].isAccept) {
      return { status: false, msg: "ERR_ALREADY_REQ" };
    } else if (hostFriends && hostFriends[tuid] && hostFriends[tuid].isAccept) {
      return { status: false, msg: "ERR_ALREADY_FRIENDS" };
    }

    return { target: querySnapshot.docs[0].data(), status: true, msg: "SUC_FIND" };
  } catch (error) {
    console.error(error);
  }
}

// 친구 요청
export async function requestFriend({ uid, tuid }: { uid: string; tuid: string }) {
  try {
    const hostDocRef = doc(userCollection, uid);
    const hostDoc = await getDoc(hostDocRef);
    const hostData = hostDoc.data();

    const targetDocRef = doc(userCollection, tuid);
    const targetDoc = await getDoc(targetDocRef);
    const targetData = targetDoc.data();

    // 이미 요청을 보낸 대상인지 조회 &&  이미 친구인지 확인
    const hostFriends = hostData?.friends;
    const targetFriends = targetData?.friends;

    const msg = hostData?.name + "님이 친구 요청을 보냈습니다.";
    const read = await isTargetOnlineOnChatRoom({ uid: uid, tuid: tuid });
    // 고유 채팅방 생성
    await addDoc(chatCollection, {
      // 친구 요청 보낸 타겟이 호스트가 되는 구조 ^_^
      host: uid,
      target: tuid,
      isAccept: false,
      // 친구 요청을 보낸다는 메시지를 전송하기
      chat: [{ sender: uid, message: msg, timestamp: new Date(), read: read }],
    }).then(async (res) => {
      // 호스트 사용자 db 업데이트
      // 호스트 사용자 db의 친구 데이터의 타겟 사용자는 호스트가 아니기 때문에 false ><
      const updatedHostFriends = {
        ...hostFriends,
        [tuid]: { uid: tuid, isAccept: false, isHost: false, unReadMsg: 0, latestMsg: msg, lastMsgAt: new Date(), chat_id: res.id },
      };
      const updatedTargetFriends = {
        ...targetFriends,
        [uid]: { uid: uid, isAccept: false, isHost: true, unReadMsg: 1, latestMsg: msg, lastMsgAt: new Date(), chat_id: res.id },
      };

      // 요청 받는 사용자 db 업데이트
      await updateDoc(hostDocRef, { friends: updatedHostFriends });
      await updateDoc(targetDocRef, { friends: updatedTargetFriends });
      // 생성된 문서의 ID를 가져와서 chat_id 필드에 업데이트
      await updateDoc(res, { chat_id: res.id });
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 친구 수락
export async function acceptRequest({ uid, tuid, chatID }: { uid: any; tuid: any; chatID: string }) {
  try {
    // 호스트 uid
    const hostDocRef = doc(userCollection, uid);
    const hostDoc = await getDoc(hostDocRef);
    const hostData = hostDoc.data();
    // 타겟 uid
    const targetDocRef = doc(userCollection, tuid);
    const targetDoc = await getDoc(targetDocRef);
    const targetData = targetDoc.data();

    // 채팅방 가져오기
    const chatDocRef = doc(chatCollection, chatID);
    const chatDoc = await getDoc(chatDocRef);
    const chatData = chatDoc.data();

    const msg = hostData?.name + "님이 친구 요청을 수락했습니다.";
    const read = await isTargetOnlineOnChatRoom({ uid: uid, tuid: tuid });

    // 채팅 데이터 저장
    const acceptRequestMsg = [
      // 친구 요청을 수락했다는 메시지 전달
      { sender: uid, message: null, timestamp: new Date(), read: null },
      { sender: uid, message: msg, timestamp: new Date(), read: read },
      ...chatData?.chat,
    ];
    await updateDoc(chatDocRef, { isAccept: true, chat: acceptRequestMsg });

    // 호스트 친구 목록에 업데이트
    const updatedHostFriends = { ...hostData?.friends, [tuid]: { ...hostData?.friends[tuid], isAccept: true, latestMsg: msg, lastMsgAt: new Date() } };
    await updateDoc(hostDocRef, { friends: updatedHostFriends });

    // 타겟 친구 목록에 업데이트
    const updatedTargetFriends = {
      ...targetData?.friends,
      [uid]: { ...targetData?.friends[uid], isAccept: true, latestMsg: msg, lastMsgAt: new Date(), unReadMsg: read ? 0 : 1 },
    };
    await updateDoc(targetDocRef, { friends: updatedTargetFriends });

    return { friends: updatedTargetFriends, name: targetData?.name, tag: targetData?.tag };
  } catch (error) {
    console.error(error);
  }
}

// 실시간 친구 목록 가져오기
export async function getFriends({ uid }: { uid: string }, callback: (friends: any[]) => void) {
  try {
    const userDocRef = doc(userCollection, uid);
    const unsubscribe = onSnapshot(userDocRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data && data.friends) {
          // 각 친구 UID에 대해 getUserByUid 호출
          const friendsPromises = Object.values(data.friends).map((friend: any) => getUserByUid({ uid: friend.uid }));
          // 모든 getUserByUid 호출이 완료될 때까지 기다림
          const friends = await Promise.all(friendsPromises);
          // lastMsgAt 기준으로 정렬
          const sortedFriends = friends
            .filter((friend) => friend !== null)
            .sort((a, b) => {
              const dateA = new Date(a?.lastMsgAt);
              const dateB = new Date(b?.lastMsgAt);
              return dateB.getTime() - dateA.getTime();
            });
          callback(sortedFriends);
        } else {
          callback([]);
        }
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  } catch (error) {
    return console.error("user.ts, getFriends() ERR: ", error);
  }
}

// 프로필 정보 변경 저장
export async function saveProfile(user: any) {
  try {
    console.log(user);
    const userDocRef = doc(userCollection, user.uid);
    await updateDoc(userDocRef, user);
    return true;
  } catch (error) {
    console.error("user.ts, saveProfile() ERR: ", error);
    return null;
  }
}

// 이미 존재하는 이름인지 유효성 검사
export async function isExistName({ name, tag }: { name: string; tag: string }) {
  try {
    const q = query(userCollection, where("name", "==", name), where("tag", "==", tag));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error(error);
    return true;
  }
}
