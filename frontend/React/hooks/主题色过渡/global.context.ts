import { GlobalContextType } from "@/hooks/view-transition.hook";
import { createContext, useContext } from "react";

export const GlobalCtx = createContext<GlobalContextType | null>(null);

/**
 * 获取全局上下文hook
 * @returns
 */
export function useGlobalCtx(): GlobalContextType {
  return useContext(GlobalCtx)!;
}
