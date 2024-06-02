import { db, auth } from "@/db/firebase";
import { collection, doc, updateDoc, getDocs, getDoc, query, where, onSnapshot } from "firebase/firestore";

const userCollection = collection(db, "user");

// 사용자 정보 가져오기
export async function getUser() {
  try {
    const userDocRef = doc(userCollection, auth.currentUser?.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
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

// 친구 요청
export async function requestFriend({ uid, target }: { uid: string; target: string }) {
  try {
    const hostDocRef = doc(userCollection, uid);
    const hostDoc = await getDoc(hostDocRef);
    const hostData = hostDoc.data();

    // 등록하려는 사용자 db 조회 (이름과 태그로 조회)
    const [name, tag] = target.split("#");
    const q = query(userCollection, where("name", "==", name), where("tag", "==", tag));
    const querySnapshot = await getDocs(q);
    // 요청을 보낼 대상이 db에 존재하지 않을 때
    if (querySnapshot.size === 0) {
      return { status: false, msg: "ERR_NOT_USER" };
    }
    // 대상 조회 성공 시
    const target_uid = querySnapshot.docs[0].id;
    const targetDocRef = doc(userCollection, target_uid);
    const targetDoc = await getDoc(targetDocRef);
    const targetData = targetDoc.data();

    // 자기 자신에게 보내는 경우
    if (uid === target_uid) {
      return { status: false, msg: "ERR_SELF" };
    }

    // 이미 요청을 보낸 대상인지 조회 &&  이미 친구인지 확인
    const hostFriends = hostData?.friends;
    const targetFriends = targetData?.friends;

    if (hostFriends && hostFriends[target_uid] && !hostFriends[target_uid].isAccept) {
      return { status: false, msg: "ERR_ALREADY_REQ" };
    } else if (hostFriends && hostFriends[target_uid] && hostFriends[target_uid].isAccept) {
      return { status: false, msg: "ERR_ALREADY_FRIENDS" };
    }

    // 호스트 사용자 db 업데이트
    const updatedHostFriends = { ...hostFriends, [target_uid]: { uid: target_uid, isAccept: false, isHost: true } };
    await updateDoc(hostDocRef, { friends: updatedHostFriends });

    // 요청 받는 사용자 db 업데이트
    const updatedRecFriends = { ...targetFriends, [uid]: { uid: uid, isAccept: false, isHost: false } };
    await updateDoc(targetDocRef, { friends: updatedRecFriends });

    return { status: true, msg: "SUC_ADD" };
  } catch (error) {
    console.error(error);
  }
}

// 친구 수락
export async function acceptRequest({ uuid, tuid }: { uuid: any; tuid: any }) {
  try {
    // 호스트 uid
    const hostDocRef = doc(userCollection, uuid);
    const hostDoc = await getDoc(hostDocRef);
    const hostData = hostDoc.data();
    // 타겟 uid
    const targetDocRef = doc(userCollection, tuid);
    const targetDoc = await getDoc(targetDocRef);
    const targetData = targetDoc.data();

    // 호스트 친구 목록에 업데이트
    const updatedHostFriends = { ...hostData?.friends, [tuid]: { ...hostData?.friends[tuid], isAccept: true } };
    await updateDoc(hostDocRef, { friends: updatedHostFriends });

    // 타겟 친구 목록에 업데이트
    const updatedTargetFriends = { ...targetData?.friends, [uuid]: { ...targetData?.friends[uuid], isAccept: true } };
    await updateDoc(targetDocRef, { friends: updatedTargetFriends });
    
    return targetData?.name || "NULL";
  } catch (error) {
    console.error(error);
  }
}

// 친구 목록 가져오기
export async function getFriends({ uid }: { uid: string }, callback: (friends: any[]) => void) {
  const userDocRef = doc(userCollection, uid);

  const unsubscribe = onSnapshot(userDocRef, async (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data && data.friends) {
        // 각 친구 UID에 대해 getUserByUid 호출
        const friendsPromises = Object.values(data.friends).map((friend: any) => getUserByUid({ uid: friend.uid }));
        // 모든 getUserByUid 호출이 완료될 때까지 기다림
        const friends = await Promise.all(friendsPromises);
        callback(friends.filter((friend) => friend !== null));
      } else {
        callback([]);
      }
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}
