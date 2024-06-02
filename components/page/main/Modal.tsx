"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CustomButton } from "@/components/ui/Buttons";
import { isExistName, saveProfile } from "@/controller/user";

const Modal = ({ className, children, onClick }: { className?: string; children?: React.ReactNode | null; onClick?: () => void }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="absolute w-full h-full bg-gray-500 opacity-50"></div>
      <div className={cn("relative bg-white rounded-lg shadow-md w-96", className)}>
        <div className="p-6">{children}</div>
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={() => {
            onClick && onClick();
          }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const EditProfile = ({ user, close }: { user: any; close: () => void }) => {
  const [profile, setProfile] = useState<any>(user);
  const [name, setName] = useState(profile.name);
  const [tag, setTag] = useState(profile.tag);
  const [statusMsg, setStatusMsg] = useState(profile.status_msg);

  const handleSave = async () => {
    if (await isExistName({ name: name, tag: tag })) {
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
    <Modal onClick={close}>
      <div className="border-b mb-4">
        <p className="text-xl">프로필 수정</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        {/* 프로필 사진 */}
        <div className="w-20 h-20 flex justify-center items-center rounded-full overflow-hidden border">
          <Image src={profile.photoURL || ""} width={80} height={80} alt="프로필 사진" />
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
