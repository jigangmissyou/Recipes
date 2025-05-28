import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, Router } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/recipes',
    name: 'RecipeList',
    component: () => import('../views/RecipeListView.vue')
  },
  {
    path: '/add-recipe',
    name: 'AddRecipe',
    component: () => import('../views/AddRecipesView.vue')
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetailView.vue')
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: () => import('../views/MyRecipesView.vue')
  },
  {
    path: '/edit-recipe/:id',
    name: 'EditRecipe',
    component: () => import('../views/EditRecipeView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/liked-recipes',
    name: 'LikedRecipes',
    component: () => import('../views/LikedRecipesView.vue')
  },
  {
    path: '/my-comments',
    name: 'MyComments',
    component: () => import('../views/MyCommentsView.vue')
  },
  {
    path: '/edit-profile/:id',
    name: 'EditProfile',
    component: () => import('../views/EditProfileView.vue')
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router as Router