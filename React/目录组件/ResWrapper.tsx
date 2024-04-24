import { Input } from 'antd';
import Style from './style.less';
import { SearchOutlined } from '@ant-design/icons';
import Item, { ItemProps } from './Item';
import { useEffect, useState } from 'react';

type ResWrapperProps = {
  menuList: any[]; // 目录列表
  bottomRender: React.ReactNode;
  activeItemId: number;
  onClickMenuItem: (reposId: number, key: string, repos: { id: number; name: string }) => void;
} & Pick<ItemProps, 'itemMenu' | 'onClickItem'>;

const ResWrapper: React.FC<ResWrapperProps> = (props) => {
  const isChrome = navigator.userAgent.indexOf('WebKit') > -1;
  const [keyword, setKeyword] = useState('');
  const [isComposing, setComposing] = useState(false);

  /**
   * item组件循环渲染
   * @returns
   */
  const itemRender = () => {
    return props.menuList.map((item) => {
      if (keyword && !item.name.match(keyword)) return null;

      return (
        <Item
          key={item.id}
          title={item.name}
          itemMenu={props.itemMenu}
          reposId={item.id}
          activeReposId={props.activeItemId}
          onClickItem={props.onClickItem}
          onClickMenuItem={(reposId, key) => props.onClickMenuItem(reposId, key, item)}
        />
      );
    });
  };

  return (
    <div className={Style.wrapper}>
      <div className={Style.headContainer}>
        <div className={Style.headContainerTitle}>资源栏目</div>
        <div className={Style.headContainerCount}>{props.menuList.length}</div>
      </div>

      <Input
        className={Style.inputComp}
        size="small"
        placeholder="请输入栏目名称进行搜索"
        prefix={<SearchOutlined style={{ color: '#616161' }} />}
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

      <div className={Style.scrollContainer}>{itemRender()}</div>

      <div className={Style.bottomBtn}>{props.bottomRender}</div>
    </div>
  );
};

export default ResWrapper;
