import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const ErrMsg = (code: any) => {
  switch (code) {
    case "ERR_NOT_USER":
      return { status: false, msg: "그런 사람은 없습니다." };
    case "ERR_ALREADY_REQ":
      return { status: false, msg: "이미 친구요청을 보냈습니다. 기다려보세요." };
    case "ERR_ALREADY_FRIENDS":
      return { status: false, msg: "두 분은 이미 친구네요." };
    case "ERR_SELF":
      return { status: false, msg: "자기 자신에게 친구 요청을 보내셨나요...?" };
    case "SUC_FIND":
      return { status: true, msg: "suc" };
    default:
      return { status: false, msg: "ERROR" };
  }
};
