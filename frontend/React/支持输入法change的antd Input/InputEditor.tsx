import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { memo, FC, useState } from "react";

export type InputEditProps = {
  onChange: (value: string) => void;
};

const InputEdit: FC<InputEditProps> = (props) => {
  const isChrome = navigator.userAgent.indexOf("WebKit") > -1;
  const [isComposing, setComposing] = useState(false); // 是否正在输入

  return (
    <Input
      placeholder={props.searchPlaceholder || "搜索用户"}
      prefix={<SearchOutlined />}
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={(evt) => {
        const value: string = (evt.target as any).value;
        setComposing(false);
        if (isChrome) {
          props.onChange(value);
        }
      }}
      onChange={(e) => {
        const rawValue = e.target.value;
        // 未使用输入法
        if (!isComposing) {
          props.onChange(rawValue);
          return;
        }

        // 非chrome：输入法start -> 输入法end -> onChange
        // chrome：输入法start -> onChange -> 输入法end
        if (!isChrome) {
          props.onChange(rawValue);
        }
      }}
    />
  );
};

export default memo(InputEdit);
