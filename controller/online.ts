import { db } from "@/db/firebase";
import { collection, doc, getDoc } from "firebase/firestore";

const onlineCollection = collection(db, "online");

export async function isTargetOnlineOnChatRoom({ uid, tuid }: { uid: string; tuid: string }) {
  try {
    const onlineDocRef = doc(onlineCollection, tuid);
    const onlineDoc = await getDoc(onlineDocRef);
    const onlineData = onlineDoc.data();

    if (onlineData?.target === uid) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("isOnlineOnChatRoom [ERROR]: ", error);
  }
}
