// 运行时配置

import { AppWrapper } from '@/components/EmptyComponent';
import React from 'react';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};

/**
 * 修改交给 react-dom 渲染时的根组件
 * @doc https://umijs.org/docs/api/runtime-config#rootcontainer
 * @param container
 * @returns
 */
export function rootContainer(container: JSX.Element) {
  return React.createElement(AppWrapper, null, container);
}
