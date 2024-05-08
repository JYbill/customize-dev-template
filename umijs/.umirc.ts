import { defineConfig } from '@umijs/max';

export default defineConfig({
  hash: true, // 让build后的产物包含hash后缀
  /**
   * 配置html <head>中的额外script
   */
  headScripts: [],
  /**
   * 指向依赖时：`foo: require.resolve('foo')`
   *
   * foo: '/tmp/to/foo' 时
   * import 'foo/bar' -> import '/tmp/to/foo/bar'
   * 如果不希望子路径被映射，应改为
   * foo$: '/tmp/to/foo'
   * import 'foo/bar' -> import 'foo/bar'
   */
  alias: {}, // import路径别名，默认支持`@` -> src
  antd: {
    configProvider: {},
    appConfig: {},
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: false, //
  layout: {
    title: '侧边栏标题',
    locale: false,
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      path: '/antd',
      layout: false, // 不使用layout布局，max不使用ant design管理系统布局
      // 用layout布局作为组件
      component: '@/layouts/AntdLayout.tsx',
      routes: [
        {
          path: '/antd/',
          redirect: '/antd/form-upload',
        },
        {
          path: 'form-upload',
          component: './Antd/FormUpload',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
});
