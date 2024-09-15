import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/bookmanage',
    name: 'bookmanage',
    component: () => import('../views/BookManagement.vue'),

  },
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/UserInfo.vue')
  },
  {
    path: '/borrow',
    name: 'borrow',
    component: () => import('../views/BorrowBook.vue')
  },
  {
    path: '/notice',
    name: 'back',
    component: () => import('../views/NoticeManagement.vue')
  }, {
    path: '/admin/bookmanage',
    name: 'admin-bookmanage',
    component: () => import('../views/admin/BookManagement.vue'),

  },
  {
    path: '/admin/user',
    name: 'admin-user',
    component: () => import('../views/admin/UserInfo.vue')
  },
  {
    path: '/admin/notice',
    name: 'admin-notice',
    component: () => import('../views/admin/NoticeManagement.vue')
  },
  {
    path: '/admin/borrow',
    name: 'admin-borrow',
    component: () => import('../views/admin/BorrowBook.vue')
  },
  {
    path: '/admin/analysis',
    name: 'admin-analysis',
    component: () => import('../views/admin/SysAnalysis.vue')
  }
]


const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHistory('hash'),
  routes: routes
})


export default router
