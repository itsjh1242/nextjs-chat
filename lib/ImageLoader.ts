export default function myImageLoader({ src, width, quality, about }: { src: string; width: string; quality: any; about: string }) {
  if (about === "public") {
    return "";
  } else {
    return `https://itsjh1242.github.io/nextjs-chat/${src}?w=${width}&q=${quality || 75}`;
  }
}
