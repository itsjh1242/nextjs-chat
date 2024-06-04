import { CustomButton } from "./Buttons";
import { Emoji_HandGesturesWavingHandMediumLight, Emoji_HandGesturesWavingHandLight } from "./Emoji";

// 친구 요청이 도착했을 때
export const FriendReqeusted = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className=" flex justify-center items-center mb-4">
      <div className="relative flex flex-col justify-center items-center gap-4 p-4 rounded-xl shadow-lg overflow-hidden">
        <div className="z-10 absolute top-0 left-0 w-full h-full bg-slate-100 opacity-50"></div>
        <div className="z-20 flex flex-col justify-center items-center">
          <Emoji_HandGesturesWavingHandMediumLight />
          <p className="font-semibold">친구 요청이 도착했어요!</p>
          <CustomButton onClick={onClick}>수락하기</CustomButton>
        </div>
      </div>
    </div>
  );
};

// 친구 요청 수락 메시지
export const FriendAccepted = () => {
  return (
    <div className=" flex justify-center items-center mb-4">
      <div className="relative flex flex-col justify-center items-center gap-4 p-4 rounded-xl shadow-lg overflow-hidden">
        <div className="z-10 absolute top-0 left-0 w-full h-full bg-slate-100 opacity-50"></div>
        <div className="z-20 flex flex-col justify-center items-center">
          <Emoji_HandGesturesWavingHandLight />
          <p className="font-semibold">친구가 생겼네요!</p>
          <p className="text-blue-500 ">이제 채팅할 수 있어요.</p>
        </div>
      </div>
    </div>
  );
};
