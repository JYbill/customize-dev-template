/**
 * @time 2024/4/18
 * @auth Administrator
 * @desc
 */
import React, { memo, useCallback, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import Style from './index.less';
import { Dropdown, Input, MenuProps, Space } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';

export type ManageOperateNavProps = {
  addTriggerNode: ReactNode;
  showBatchDel?: boolean; // 默认为false
  dropDownName1?: string;
  clickDropDownItem1?: ({ key }: { key: string }) => void;
  dropDownItem1?: MenuProps['items']; // 下拉菜单1
  dropDownName2?: string;
  dropDownItem2?: MenuProps['items']; // 下拉菜单2
  clickDropDownItem2?: ({ key }: { key: string }) => void;
  searchPlaceholder?: string;
};
const Index: FC<ManageOperateNavProps> = (props) => {
  const bitchDelRender = () => {
    if (props.showBatchDel) {
      return (
        <div className={Style.bitchDel}>
          <img className={Style.batchDelIcon} src="/assets/del-icon.png" alt="" />
          <span>批量删除</span>
        </div>
      );
    }
  };

  /**
   * 下拉菜单1渲染
   * @returns
   */
  const dropdown1Render = () => {
    if (props.dropDownName1 && props.dropDownItem1 && props.clickDropDownItem1) {
      return (
        <Dropdown
          className={Style.selectDropdown}
          menu={{ items: props.dropDownItem1 || [], onClick: props.clickDropDownItem1 }}
          trigger={['click']}
        >
          <Space className={Style.dropDownSpace}>
            {props.dropDownName1 || '下拉菜单一'}
            <DownOutlined style={{ fontSize: '12px' }} />
          </Space>
        </Dropdown>
      );
    }
    return '';
  };

  /**
   * 下拉菜单2渲染
   * @returns
   */
  const dropdown2Render = () => {
    if (props.dropDownName2 && props.dropDownItem2 && props.clickDropDownItem2) {
      return (
        <Dropdown
          className={Style.selectDropdown}
          menu={{ items: props.dropDownItem2 || [], onClick: props.clickDropDownItem2 }}
          trigger={['click']}
        >
          <Space className={Style.dropDownSpace}>
            {props.dropDownName2 || '下拉菜单二'}
            <DownOutlined style={{ fontSize: '12px' }} />
          </Space>
        </Dropdown>
      );
    }
    return '';
  };

  return (
    <div className={Style.manageOperateNav}>
      <div className={Style.left}>
        {props.addTriggerNode}
        {bitchDelRender()}
      </div>
      <div className={Style.right}>
        {/* 下拉菜单1 */}
        {dropdown1Render()}

        {/* 下拉菜单2 */}
        {dropdown2Render()}

        {/* 搜索框 */}
        <Input className={Style.search} placeholder={props.searchPlaceholder || "搜索用户"} prefix={<SearchOutlined />} />
      </div>
    </div>
  );
};

export default memo(Index);
