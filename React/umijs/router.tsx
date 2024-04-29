/**
 * @file: router.tsx
 * @author: xiaoqinvar
 * @desc: umijs路由，如果想
 * @date: 2024-04-26 14:05:53
 */
export default [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    layout: false,
    name: "首页",
    component: "./Home",
  },
  {
    path: "/recommend/:type",
    layout: false, // 关闭antd布局 or @/layouts/index.tsx布局
    exact: true, // umijs v3（react-router严格路由）
    routes: [
      {
        path: "/recommend/:type",
        name: "资源库",
        component: "web/Recommend/index",
        exact: true,
      },
      {
        path: "/recommend/:type/:id",
        name: "资源详情",
        component: "web/Detail/index",
        exact: true,
      },
    ],
  },
  {
    path: "/search",
    layout: false,
    component: "./web/Search/index",
  },

  // 管理页面
  {
    path: "/manager",
    redirect: "/manager/user",
  },
  {
    path: "/manager/user",
    name: "用户账号管理", // 设置左侧边栏的菜单名
    icon: false,
    component: "./Manager/User",
  },
  {
    path: "/manager/repos",
    name: "资源库管理",
    icon: false,
    component: "./Manager/Repos",
  },
  {
    path: "/manager/course",
    name: "课程管理",
    icon: false,
    component: "./Manager/Course",
  },
  {
    path: "*",
    layout: false,
    component: "./404",
  },
];
