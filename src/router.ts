import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getStoredToken } from '@/composables/useApi'

const routes : Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => (getStoredToken() ? '/dashboard' : '/login'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/sessions/:id',
    name: 'session-detail',
    component: () => import('./SessionDetailView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  // Note: We're using createMemoryHistory() here for compatibility
  //       with the Playground. In a real application you'd usually
  //       use createWebHistory() or createWebHashHistory() instead,
  //       tying the route to the browser URL. See the documentation
  //       for more information about history modes.
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = getStoredToken()
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)

  if (needsAuth && !token) {
    return {
      name: 'login',
      query: to.fullPath === '/login' ? {} : { redirect: to.fullPath },
    }
  }

  if (guestOnly && token) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
