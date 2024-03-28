import { onMounted, type Ref, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

export function useViewTransition(focusClazz: string) {

  // 依赖：useDark、useToggle
  const isDark = useDark({ storageKey: "theme", disableTransition: false });
  const toggleDark = useToggle(isDark);

  const themeSwitchPos = { x: 0, y: 0 };
  onMounted(() => {
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
      toggleDark();
      return;
    }

    const root = document.documentElement;
    const transition = document.startViewTransition(toggleDark);

    // 设置view-transition-old/view-transition-new的伪类样式
    transition.ready.then(() => {
      // 创建动画帧
      // 裁剪元素根据半径裁剪
      // 切换为黑色主题：circle(100%) -> circle(Switch组件中心位置)
      // 切换为白色主题：circle(Switch组件中心位置) -> circle(100%) 顺序要反转
      const clipPathList = [
        "circle(100%)",
        `circle(10px at ${themeSwitchPos.x}px ${themeSwitchPos.y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: isDark.value ? clipPathList : clipPathList.reverse(),
        },
        {
          duration: 400,
          easing: "ease-out",
          pseudoElement: isDark.value
            ? "::view-transition-old(isDark)"
            : "::view-transition-new(isDark)",
        }
      );
    });
  }

  // 通过返回值暴露所管理的状态
  return triggerSwitchTheme;
}

/**
 * ⚠️ 依赖于下面的CSS样式
 * #app {
 *   width: 100%;
 *   height: auto;
 *   background-color: var(--el-bg-color);
 *
 *   // 如果没有这个属性，改变默认受"root"影响
 *   view-transition-name: isDark;
 * }
 *
 * html::view-transition-old(isDark),
 * html::view-transition-new(isDark) {
 *   animation: none;
 * }
 *
 * // 截图旧视图做动画缩小
 * html::view-transition-old(isDark) {
 *   z-index: 100000; // 置于最上
 * }
 * html::view-transition-new(isDark) {
 *   z-index: 2147483647;
 * }
 *
 * // .dark类表示此时为黑色主题，所以截图z-index应该与白色主题相反
 * html.dark::view-transition-old(isDark) {
 *   z-index: 2147483647;
 * }
 * html.dark::view-transition-new(isDark) {
 *   z-index: 100000;
 * }
 */
