import Image from "next/image";

export const Emoji_Astronaut = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Astronaut.png" alt="Astronaut" width={w || 256} height={h || 256} />;
};

export const Emoji_ManBouncingBallDarkSkin = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Man Bouncing Ball Dark Skin Tone.png" alt="Man Bouncing Ball Dark Skin Tone" width={w || 256} height={h || 256} />;
};

export const Emoji_WomanFacepalmingLightSkinTone = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Woman Facepalming Light Skin Tone.png" alt="Woman Facepalming Light Skin Tone" width={w || 256} height={h || 256} />;
};

export const Emoji_WomanGesturingNoMediumLightSkinTone = ({ w, h }: { w?: number; h?: number }) => {
  return (
    <Image src="/emoji/Woman Gesturing No Medium-Light Skin Tone.png" alt="Woman Gesturing No Medium-Light Skin Tone" width={w || 256} height={h || 256} />
  );
};

export const Emoji_ClappingHandsLightSkin = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Clapping Hands Light Skin Tone.png" alt="Clapping Hands Light Skin Tone" width={w || 256} height={h || 256} />;
};

export const Emoji_HandGesturesWavingHandMediumLight = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Waving Hand Medium-Light Skin Tone.png" alt="Waving Hand Medium-Light Skin Tone" width={w || 256} height={h || 256} />;
};

export const Emoji_HandGesturesWavingHandLight = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Folded Hands Light Skin Tone.png" alt="Folded Hands Light Skin Tone" width={w || 256} height={h || 256} />;
};

export const Emoji_LoveLetter = ({ w, h }: { w?: number; h?: number }) => {
  return <Image src="/emoji/Love Letter.png" alt="Love Letter" width={w || 256} height={h || 256} />;
};
