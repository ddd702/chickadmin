import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import CkIcon from '@/components/CkIcon.vue';
import CkPage from '@/components/CkPage.vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
//引入 nprogress
import NProgress from 'nprogress'; // 进度条
import 'nprogress/nprogress.css'; // 引入样式
import App from './App.vue';
import setRouter from './router';
import Utils from './utils';
import { useLayoutStore } from '@/stores/layout';
import { useRouteStore } from '@/stores/route';
import { useLogStore, LogEnum } from '@/stores/log';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles/app.scss';
import './styles/iconfont/iconfont.css';
(async () => {
  // 这里为啥要用async 我有必要说下：
  // 因为自动生成router的原因，是个异步操作获取相关信息

  (window as any).appUtils = Utils;
  const app = createApp(App);
  app.use(createPinia());

  const router = await setRouter();
  app.use(router);
  console.warn('router', router.getRoutes());

  app.use(ElementPlus, {
    locale: zhCn,
  });

  //注册全局组件
  app.component('CkIcon', CkIcon);
  app.component('CkPage', CkPage);
  app.mount('#app');
  //app.use(createPinia()) 后才能初始化store
  const layoutStore = useLayoutStore();
  const logStore = useLogStore();
  const routeStore = useRouteStore();
  routeStore.setAllRoutes(router.getRoutes());
  /**收集错误
   */
  app.config.errorHandler = (err: any, _instance, info) => {
    console.error('vue err', err);
    // 处理错误，例如：报告给一个服务
    logStore.add({
      info: err.message || '未知错误',
      err,
      type: LogEnum.Err,
      url: location.href,
      title: info,
    });
  };
  window.addEventListener('error', (event) => {
    console.error('window error', event);
  });
  // 简单配置NProgress
  NProgress.inc(0.2);
  NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

  // 进度条开始
  router.beforeEach((to, from, next) => {
    Utils.setTitle(to.meta.title || '我的管理系统');
    routeStore.addCache(to);
    routeStore.setCurrentRoute(to);
    layoutStore.updateAsideMenuActive();
    NProgress.start();
    next();
  });

  // 进度条结束
  router.afterEach(() => {
    NProgress.done();
  });
  // 设置一些页面布局的操作
  /** 设置暗黑还是浅色模式
   * 设置win滚动条
   */
  if (Utils.isWin) {
    document.querySelector('html')?.classList.add('win-scrollbar');
  }

  layoutStore.updateDark();
})();
