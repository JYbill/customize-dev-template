/**
 * @file: App.tsx
 * @author: xiaoqinvar
 * @desc: 演示主题色过渡的Demo文件
 * @dependencies: antd
 * @date: 2024-03-29 18:58:34
 */
import { ConfigProvider, theme } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useState } from "react";
import { GlobalCtx } from "./context/global.context";

function App() {
  const [themeAlgo, setThemeAlgo] = useState([theme.darkAlgorithm]);
  const [isDark, setDarkState] = useState(true);

  // 全局上下文
  function changeTheme() {
    if (isDark) {
      setThemeAlgo([theme.defaultAlgorithm]);
    } else {
      setThemeAlgo([theme.darkAlgorithm]);
    }
  }

  return (
    <GlobalCtx.Provider value={{ changeTheme, isDark, setDarkState }}>
      <ConfigProvider theme={{ algorithm: themeAlgo, cssVar: true, hashed: false }}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </GlobalCtx.Provider>
  );
}

export default App;
