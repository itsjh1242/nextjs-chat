import { useEffect, useState } from "react";
import { getFriends, getUserByNameTag, requestFriend } from "@/controller/user";

export default function useFriends({ user }: { user: any }) {
  // 친구 목록
  const [friends, setFriends] = useState<any[] | null>(null);
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
      const res = await getUserByNameTag({ uid: user?.uid, target: [findName, findTag] });
      console.log(res?.msg);
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
  }, [user]);

  return {
    friends: friends,
    findName: findName,
    setFindName: setFindName,
    findTag: findTag,
    setFindTag: setFindTag,
    findModal: findModal,
    setFindModal: setFindModal,
    findModalHandler: findModalHandler,
    targetData: targetData,
    setTargetData: setTargetData,
    reqSuc: reqSuc,
    setReqSuc: setReqSuc,
    findHandler: findHandler,
    requestHandler: requestHandler,
  };
}
