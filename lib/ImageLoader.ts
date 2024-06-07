export default function imageLoader({ src, width, quality }: { src: string; width: string; quality: any }) {
  if (src.startsWith("http")) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  return `https://itsjh1242.github.io/nextjs-chat${src}?w=${width}&q=${quality || 75}`;
}
