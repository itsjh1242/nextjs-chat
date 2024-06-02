export function cs({ color }: { color: string | null }) {
  switch (color) {
    case "blue":
      return { bg: "bg-blue-500", bgd: "hover:bg-blue-600" };
    case "red":
      return { bg: "bg-red-500", bgd: "hover:bg-red-600" };
    case "green":
      return { bg: "bg-green-500", bgd: "hover:bg-green-600" };
    case "gray":
      return { bg: "bg-gray-500", bgd: "hover:bg-gray-600" };
    // 필요한 다른 색상들을 추가하세요.
    default:
      return { bg: "bg-blue-500", bgd: "hover:bg-blue-600" }; // 기본 색상
  }
}
