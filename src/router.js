import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./views/DashboardView.vue'),
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('./views/VehiclesView.vue'),
  },
  {
    path: '/vehicles/:vehicleCode',
    name: 'VehicleDetail',
    component: () => import('./views/VehicleDetailView.vue'),
  },
  {
    path: '/trips/:vehicleCode?',
    name: 'Trips',
    component: () => import('./views/TripsView.vue'),
  },
  {
    path: '/eco-driving/:vehicleCode?',
    name: 'EcoDriving',
    component: () => import('./views/EcoDrivingView.vue'),
  },
  {
    path: '/sensors/:vehicleCode?',
    name: 'Sensors',
    component: () => import('./views/SensorsView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
