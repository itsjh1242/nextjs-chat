"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CustomButton } from "@/components/ui/Buttons";
import { isExistName, saveProfile } from "@/controller/user";
import { Emoji_ClappingHandsLightSkin } from "@/components/ui/Emoji";

export const Modal = ({ className, children, onClick }: { className?: string; children?: React.ReactNode | null; onClick?: () => void }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="absolute w-full h-full bg-gray-500 opacity-50"></div>
      <div className={cn("relative bg-white rounded-lg shadow-md w-96", className)}>
        <div className="p-6">{children}</div>
        {onClick && (
          <button
            className="absolute top-2 right-2 text-gray-500"
            onClick={() => {
              onClick();
            }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const MobileSearch = ({ friends }: { friends: any }) => {
  const [show, setShow] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);
  const closeHandler = () => {
    setShow(false);
    setMsg(null);
  };
  const findHandler = async () => {
    const res = await friends.friends.findHandler();
    if (res) {
      setMsg(res);
    } else {
      setShow(false);
    }
  };
  const modal = (
    <Modal
      className="w-full bg-white rounded-xl shadow-xl mx-2"
      onClick={() => {
        closeHandler();
      }}
    >
      <div className="flex flex-col gap-4">
        <p className="text-xl font-semibold">친구 검색</p>
        <div>
          <label className="text-gray-500 text-sm pl-1 pb-1">이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요."
            value={friends.friends.findName || ""}
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            onChange={(e) => {
              friends.friends.setFindName(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="text-gray-500 text-sm pl-1 pb-1">태그</label>
          <input
            type="text"
            placeholder="태그를 입력하세요."
            value={friends.friends.findTag || ""}
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            onChange={(e) => {
              friends.friends.setFindTag(e.target.value);
            }}
          />
        </div>
        <p className="text-red-500 font-semibold">{msg}</p>
        <CustomButton
          onClick={() => {
            findHandler();
          }}
        >
          검색
        </CustomButton>
      </div>
    </Modal>
  );
  return { show: show, setShow: setShow, modal: modal };
};

export const AcceptFriendRequest = ({ targetName, close, isMobile }: { targetName: string[]; close: () => void; isMobile?: boolean }) => {
  const [name, tag] = targetName;
  const emojiMobileWidth = 128;
  const emojiKMobileHeight = 128;
  return (
    <Modal className={`bg-white rounded-xl shadow-xl ${isMobile ? "w-full p-2 mx-4" : "w-1/2 p-6"}   `}>
      <div className="flex flex-col justify-center items-center gap-4">
        <Emoji_ClappingHandsLightSkin w={isMobile ? emojiMobileWidth : undefined} h={isMobile ? emojiKMobileHeight : undefined} />
        <p className={`font-semibold ${isMobile ? "text-lg" : "text-2xl"}`}>새로운 친구가 생겼어요!</p>
        <p className={`text-gray-500 text-center break-keep ${isMobile ? "text-sm" : "text-lg"}`}>
          이제 <span className="text-black font-semibold">{name}</span>
          <span className="font-semibold">#{tag}</span>님과 대화할 수 있어요.
        </p>
        <CustomButton
          onClick={() => {
            close();
          }}
        >
          좋아요
        </CustomButton>
      </div>
    </Modal>
  );
};

export const FindFriend = ({
  targetData,
  reqSuc,
  requestHandler,
  close,
  isMobile,
}: {
  targetData?: any | null;
  reqSuc: boolean;
  requestHandler: () => void;
  close: () => void;
  isMobile: boolean;
}) => {
  const [preventDoubleClick, setPreventDoubleClick] = useState<boolean>(true);
  const acceptHandle = () => {
    setPreventDoubleClick(false);
    return requestHandler();
  };
  return (
    <Modal className={`bg-white rounded-xl shadow-xl ${isMobile ? "w-full mx-2" : "w-1/2  p-6"}`}>
      {reqSuc ? (
        <div className="flex flex-col justify-center items-center gap-4">
          <Emoji_ClappingHandsLightSkin />
          <p className="text-2xl font-semibold">친구요청을 보냈어요!</p>
          <p className="text-lg text-gray-500">상대방이 수락하면 대화를 시작할 수 있어요.</p>
          <CustomButton
            onClick={() => {
              close();
            }}
          >
            알겠어요
          </CustomButton>
        </div>
      ) : (
        <>
          <div className="border-b mb-4 pb-2">
            <p className={`font-semibold text-gray-800 ${isMobile ? "text-lg" : "text-2xl  "}`}>찾으시는 사람이 맞나요?</p>
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-4 truncate mb-4 pb-2">
            <div className="flex justify-center items-center rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
              <Image src={targetData.photoURL ?? "/user.png"} width={80} height={80} alt="user_icon" className="object-cover" about="public"/>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xl font-medium text-gray-900">{targetData.name}</p>
              <p className="text-xl text-gray-500">#{targetData.tag}</p>
            </div>
            {/* 상태메시지 */}
            <p className="w-full text-center text-gray-700 truncate">{targetData.status_msg}</p>
          </div>
          <div className="flex justify-center items-center gap-6 border-t mb-4 pt-2">
            <CustomButton
              className={`${!preventDoubleClick ? "pointer-events-none" : ""}`}
              onClick={() => {
                acceptHandle();
              }}
            >
              네, 맞아요
            </CustomButton>
            <CustomButton
              color="gray"
              onClick={() => {
                close();
              }}
            >
              아니에요
            </CustomButton>
          </div>
        </>
      )}
    </Modal>
  );
};

export const EditProfile = ({ user, close }: { user: any; close: () => void }) => {
  const [profile, setProfile] = useState<any>(user);
  const [name, setName] = useState(profile.name);
  const [tag, setTag] = useState(profile.tag);
  const [statusMsg, setStatusMsg] = useState(profile.status_msg);

  const handleSave = async () => {
    // 그런 다음 해당 이름과 태그가 존재하는지
    if ((profile.name !== name || profile.tag !== tag) && (await isExistName({ name: name, tag: tag }))) {
      // 존재하면
      return alert("그 이름은 누가 사용중이네요..? 태그를 다른걸로 적어봐요.");
    } else {
      // 변경된 프로필 정보 저장
      const updatedProfile = {
        ...profile,
        name: name,
        tag: tag,
        status_msg: statusMsg,
      };
      const res = await saveProfile(updatedProfile);
      if (res) {
        alert("변경된 정보로 프로필을 저장했습니다.");
      }
      close();
    }
  };

  // 특수 문자 제거
  const textPreprocessing = ({ text }: { text: string }) => {
    const ref = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gim;
    return text.replace(ref, "");
  };

  return (
    <Modal onClick={close} className="rounded-xl">
      <div className="border-b mb-4">
        <p className="text-xl">프로필 수정</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        {/* 프로필 사진 */}
        <div className="w-20 h-20 flex justify-center items-center rounded-full overflow-hidden border">
          <Image src={profile.photoURL || ""} width={80} height={80} alt="프로필 사진" about="public"/>
        </div>
        {/* 이름 입력 */}
        <div className="flex flex-col items-start w-full gap-1">
          <label htmlFor="name">이름</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(textPreprocessing({ text: e.target.value }))}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        {/* 태그 입력 */}
        <div className="flex flex-col items-start w-full gap-1">
          <label htmlFor="tag">태그</label>
          <input
            id="tag"
            type="text"
            value={tag}
            onChange={(e) => setTag(textPreprocessing({ text: e.target.value }))}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        {/* 상태메시지 입력 */}
        <div className="flex flex-col items-start w-full gap-1">
          <label htmlFor="statusMsg">상태메시지</label>
          <input id="statusMsg" type="text" value={statusMsg} onChange={(e) => setStatusMsg(e.target.value)} className="w-full border rounded-md px-3 py-2" />
        </div>
      </div>
      <div className="mt-8">
        <CustomButton className="w-full" onClick={handleSave}>
          저장
        </CustomButton>
      </div>
    </Modal>
  );
};

// 이모티콘 모달
export const EmojiModal = ({ onClick, isMobile }: { onClick: (emoji: any) => void; isMobile?: boolean }) => {
  const Emoji = Array.from(
    "😀😃😄😁😆😅🤣😂🙂🙃🫠😉😊😇🥰😍🤩😘😗😚😙🥲😋😛😜🤪😝🤑🤗🤭🫢🫣🤫🤔🫡🤐🤨😐😑😶😒🙄😬😮🤥🫨😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵😵🤯🤠🥳🥸😎🤓🧐😕🫤😟🙁😮😯😲😳🥺🥹😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀💩🤡👹👺👻👽👾🤖😺😸😹😻😼😽🙀😿😾🙈🙉🙊💋💯💢💥💫💦👋🫱🫲🫳🫴🫷🫸👌🤌🤏🤞🫰🤟🤘🤙👈👉👆🖕👇🫵👍👎✊👊🤛🤜👏🙌🫶👐🤲🤝🙏✍️💅🤳💪🦾🦿🦵🦶👂🦻👃🧠🫀🫁🦷🦴👀👅👄🫦💌💘💝💖💗💓💞💕💟💔🩷🧡💛💚💙🩵💜🤎🖤🩶🤍"
  );

  return (
    <div className={`absolute bottom-0 right-0  p-4 ${isMobile ? "w-72 h-24 -translate-y-12" : "w-96 h-48 -translate-y-8"}`}>
      <div className="z-10 w-full h-full overflow-y-scroll">
        <div className="w-full h-full flex flex-wrap justify-center items-center gap-4">
          {Emoji.map((item, index) => {
            return (
              <p key={index} className="cursor-pointer" onClick={() => onClick(item)}>
                {item}
              </p>
            );
          })}
        </div>
      </div>
      <div className="-z-10 absolute bottom-0 right-0 w-full h-full bg-slate-200 rounded-xl opacity-80" />
    </div>
  );
};
