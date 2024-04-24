import React from "react";
import { Input } from 'antd';
import Style from './style.less';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function 输入法输入() {
  const isChrome = navigator.userAgent.indexOf("WebKit") > -1;
  const [keyword, setKeyword] = useState("");
  const [isComposing, setComposing] = useState(false);
  useEffect(() => {
    console.log(1);
  }, [keyword]);

  return (
    <div>
      <Input
        className={Style.inputComp}
        size="small"
        placeholder="请输入栏目名称进行搜索"
        prefix={<SearchOutlined style={{ color: "#616161" }} />}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={(evt) => {
          setComposing(false);
          if (isChrome) {
            setKeyword((evt.target as any).value);
          }
        }}
        onChange={(e) => {
          const rawValue = e.target.value;
          // 未使用输入法
          if (!isComposing) {
            setKeyword(rawValue);
            return;
          }

          // 非chrome：输入法start -> 输入法end -> onChange
          // chrome：输入法start -> onChange -> 输入法end
          if (!isChrome) {
            setKeyword(rawValue);
          }
        }}
      />
    </div>
  );
}
