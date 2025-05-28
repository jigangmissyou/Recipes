import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, Router } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/recipes'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/recipes',
    name: 'RecipeList',
    component: () => import('../views/RecipeListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-recipe',
    name: 'AddRecipe',
    component: () => import('../views/AddRecipesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: () => import('../views/MyRecipesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-recipe/:id',
    name: 'EditRecipe',
    component: () => import('../views/EditRecipeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/liked-recipes',
    name: 'LikedRecipes',
    component: () => import('../views/LikedRecipesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-comments',
    name: 'MyComments',
    component: () => import('../views/MyCommentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-profile/:id',
    name: 'EditProfile',
    component: () => import('../views/EditProfileView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    next('/recipes')
    return
  }

  next()
})

export default router as Router