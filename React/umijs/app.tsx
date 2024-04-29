import { message } from '@/components/EmptyComponent';
import { user } from '@/services/manage';
import { GetUserInfoApi } from '@/services/webApi/user';
import { LinkOutlined } from '@ant-design/icons';
import {
  Settings as LayoutSettings,
  PageLoading,
  ProLayoutProps,
} from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { Link, history } from '@umijs/max';
import React from 'react';
import defaultSettings from '../config/defaultSettings';
import AppWrapper from './components/EmptyComponent';
import { errorConfig } from './requestErrorConfig';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * 初始化全局数据
 * @doc https://umijs.org/docs/api/runtime-config#getinitialstate
 * @returns
 */
export async function getInitialState(): Promise<
  | {
      settings?: Partial<ProLayoutProps>;
      currentUser?: UserInfo;
      loading?: boolean;
      fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
    }
  | undefined
> {
  let userInfo: any;
  try {
    userInfo = await user.getSelfInfo();
  } catch (err) {
    console.warn('用户需要登录');
  }
  if (userInfo) {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token'); // 假设令牌存储在 localStorage 中
        if (!token) {
          history.push('/home');
          return;
        }
        const msg = await GetUserInfoApi(); //检测登录信息，未登录则到达.catch跳转登录页
        return msg;
      } catch (error) {
        console.log('error', error);
        history.push('/home');
      }
      return undefined;
    };
    if (history.location.pathname !== '/home') {
      const currentUser = await fetchUserInfo();
      return {
        currentUser: userInfo,
        settings: defaultSettings as Partial<LayoutSettings>,
      };
    }

    return {
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
}

/**
 * ProLayout 支持的api
 * @doc https://procomponents.ant.design/components/layout
 * @returns
 */
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    actionsRender: () => [],
    // footerRender: () => <Footer />,
    onPageChange: () => {
      // const { location } = history;
      // // 如果没有登录，重定向到 login
      // if (!initialState?.currentUser && location.pathname !== loginPath) {
      //   history.push(loginPath);
      // }
    },
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    // menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children: any) => {
      if (initialState?.loading) return <PageLoading />;
      return <>{children}</>;
    },
    navTheme: initialState?.settings?.navTheme,
    colorPrimary: initialState?.settings?.colorPrimary,
    layout: initialState?.settings?.layout,
    contentWidth: initialState?.settings?.contentWidth,
    fixedHeader: false, // 关闭ant design 管理页面header菜单，如果需要自定义可以在page组件包一层wrapper，然后再通过useLocation()获取当前路由信息，并通过router.tsx去查对应的name字段去渲染自定义菜单
    fixSiderbar: initialState?.settings?.fixSiderbar,
    colorWeak: initialState?.settings?.colorWeak,
    title: initialState?.settings?.title,
    siderWidth: initialState?.settings?.siderWidth,
    token: initialState?.settings?.token,
    collapsedButtonRender: false,
    menuRender: (props: any, defaultDom: any) => {
      return initialState?.settings?.collapsed ? false : defaultDom;
    },
  };
};

/**
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 * @name request 配置，可以配置错误处理
 */
export const request = {
  prefix: '',
  ...errorConfig,
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
