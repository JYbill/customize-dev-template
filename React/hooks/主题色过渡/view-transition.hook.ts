import { useEffect } from "react";

export type GlobalContextType = {
  isDark: boolean;
  setDarkState: (isDark: boolean) => void;
  changeTheme: (flag?: string) => void;
};

/**
 * 切换主题色 view-transition钩子
 * @param focusClazz 聚焦元素class
 * @param useGlobalCtx 全局上下文，必须实现GlobalContextType所有内容
 * @returns
 */
export function useViewTransition(useGlobalCtx: () => GlobalContextType, focusClazz: string, duration = 400) {
  const { changeTheme, isDark, setDarkState } = useGlobalCtx();
  const toggleDark = changeTheme;

  const themeSwitchPos = { x: 0, y: 0 };
  useEffect(() => {
    const themeSwitchEl = document.querySelector(focusClazz);
    if (!themeSwitchEl) {
      throw TypeError("cannot find 'focusClazz' el, pls check your focusClazz");
    }
    const themeSwitchClient = themeSwitchEl.getBoundingClientRect();
    const x = themeSwitchClient.left + themeSwitchClient.width / 2;
    const y = themeSwitchClient.top + themeSwitchClient.height / 2;
    themeSwitchPos.x = x;
    themeSwitchPos.y = y;
  });

  function triggerSwitchTheme() {
    // 兼容 Chrome v111- 浏览器
    if (!document.startViewTransition) {
      setHtmlClazz(isDark);
      toggleDark();
      return;
    }

    const transition = document.startViewTransition(() => {
      setHtmlClazz(isDark);
      toggleDark();
    });

    // startViewTransition执行完毕的钩子
    transition.updateCallbackDone.then(() => {
      setDarkState(!isDark);
    });

    // startViewTransition updateDoneCallback钩子执行完之后，拍摄older页面快照和newer页面快照后，此时已经准备就绪，这才执行ready钩子
    // 设置view-transition-old/view-transition-new的伪类样式
    transition.ready.then(() => {
      // 创建动画帧
      // 裁剪元素根据半径裁剪
      // 切换为黑色主题：circle(100%) -> circle(组件中心)
      // 切换为白色主题：circle(组件中心) -> circle(100%)
      // ::view-transition-* 的顺序要反转
      let clipPathList = ["circle(100%)", `circle(10px at ${themeSwitchPos.x}px ${themeSwitchPos.y}px)`];
      if (!isDark) {
        clipPathList = [clipPathList[1], clipPathList[0]];
      }
      document.documentElement.animate(
        {
          clipPath: clipPathList,
        },
        {
          duration,
          easing: "ease-out",
          pseudoElement: isDark ? "::view-transition-old(isDark)" : "::view-transition-new(isDark)",
        },
      );
    });
    return transition;
  }

  /**
   * 设置主题辅助器
   */
  function setHtmlClazz(isDark: boolean) {
    const html = document.querySelector("html") as HTMLElement;
    if (isDark) {
      html.classList.remove("dark");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
    }
  }

  return {
    isDark,
    triggerSwitchTheme,
  };
}

/**
 * ⚠️ 依赖于下面的CSS样式
#root {
  width: 100%;
  height: auto;
  background-color: var(--theme-color);
  // 如果没有这个属性，改变默认受"root"影响
  view-transition-name: isDark;
}
html::view-transition-old(isDark),
html::view-transition-new(isDark) {
  animation: none;
}
// 截图旧视图做动画缩小
html::view-transition-old(isDark) {
  z-index: 2147483647;
}
html::view-transition-new(isDark) {
  z-index: 100000;
}
// .dark类表示此时为黑色主题，所以截图z-index应该与白色主题相反
html.dark::view-transition-old(isDark) {
  z-index: 100000;
}
html.dark::view-transition-new(isDark) {
  z-index: 2147483647;
}
 */
