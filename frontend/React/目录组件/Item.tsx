import { RightOutlined } from '@ant-design/icons';
import Style from './style.less';
import { Dropdown, MenuProps } from 'antd';

export type ItemProps = {
  itemMenu: MenuProps['items'];
  title: string;
  reposId: number;
  activeReposId: number;
  onClickItem: (id: number) => void;
  onClickMenuItem: (reposId: number, key: string) => void;
};

const Item: React.FC<ItemProps> = (props) => {
  const isActive = props.activeReposId === props.reposId;
  return (
    <Dropdown
      menu={{
        items: props.itemMenu,
        onClick: ({ key }) => props.onClickMenuItem(props.reposId, key),
      }}
      trigger={['contextMenu']}
    >
      <div
        className={`${Style.item} ${isActive ? Style.itemActive : ''}`}
        onClick={() => props.onClickItem(props.reposId)}
      >
        <div>{props.title}</div>
        <RightOutlined style={{ width: '12px' }} />
      </div>
    </Dropdown>
  );
};

export default Item;
