import { signInWithGoogle } from "@/db/firebase";
import { CustomButton } from "../ui/Buttons";
import { Emoji_Astronaut, Emoji_WomanFacepalmingLightSkinTone, Emoji_WomanGesturingNoMediumLightSkinTone } from "../ui/Emoji";

export function NotUser() {
  // 구글 로그인
  const handleLogin = async () => {
    await signInWithGoogle();
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center ">
      <Emoji_WomanGesturingNoMediumLightSkinTone />
      <p className="text-3xl mb-4 animate-fade-in-up">정보를 다시 가져올게요.</p>
      <p className="text-lg animate-fade-in-up mb-4">이 화면이 계속 나오나요? 그럼 다시 로그인하세요.</p>
      <CustomButton onClick={handleLogin}>다시 로그인하기</CustomButton>
    </div>
  );
}

export function NotFriend() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Emoji_WomanFacepalmingLightSkinTone />
      <p className="text-3xl mb-4 animate-fade-in-up">두 분은 아직 친구가 아니에요.</p>
      <p className="text-lg animate-fade-in-up">친구가 아닌 사람에게는 메시지를 보낼 수 없답니다.</p>
    </div>
  );
}

export function NoChat() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Emoji_Astronaut />
      <p className="text-3xl mb-4 animate-fade-in-up">친구와 대화를 시작해보세요.</p>
      <p className="text-lg animate-fade-in-up">앗, 아직 친구가 없나요? 저런...</p>
    </div>
  );
}
