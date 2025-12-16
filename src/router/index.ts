import { createRouter, createWebHistory } from 'vue-router'

const Dashboard = () => import('../views/Dashboard.vue')
const FocusLog = () => import('../views/FocusLog.vue')
const Time = () => import('../views/Time.vue')
const Notes = () => import('../views/Notes.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/notes', name: 'notes', component: Notes },
    { path: '/focus-log', name: 'focus-log', component: FocusLog },
    { path: '/time', name: 'time', component: Time },
  ],
})

export default router
