import { Emoji_ManBouncingBallDarkSkin } from "../ui/Emoji";

export function Loading() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <p className="text-3xl mb-4 animate-fade-in-up">지금 로딩중이에요.</p>
      <p className="text-lg animate-fade-in-up">접속이 안되고, 이 화면이 계속 나오나요?</p>
      <p className="text-lg animate-fade-in-up">그럼 뭔가 잘못된거같아요 ^_^</p>
    </div>
  );
}

export function LoadingFriendsList() {
  return (
    <div className="w-full h-full flex flex-wrap justify-center items-center ">
      <p>친구 목록 불러오는 중...</p>
    </div>
  );
}

export function LoadingChatData() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Emoji_ManBouncingBallDarkSkin />
      <p className="text-3xl mb-4 animate-fade-in-up">채팅 데이터를 가져올게요.</p>
      <p className="text-lg animate-fade-in-up">서두르고 있어요, 잠시면 돼요.</p>
    </div>
  );
}
