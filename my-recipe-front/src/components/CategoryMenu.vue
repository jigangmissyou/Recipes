<template>
  <div class="category-menu" :class="{ 'show': show }">
    <div class="category-menu-content">
      <div class="category-menu-header">
        <h3>Categories</h3>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="category-list">
        <div 
          class="category-item" 
          @click="selectCategory(null)"
        >
          <i class="fas fa-th-large"></i>
          <span>All Categories</span>
        </div>
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          @click="selectCategory(category.id)"
        >
          <i :class="category.icon"></i>
          <span>{{ category.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', categoryId: number | null): void
}>()

const categories = [
  { id: 1, name: 'Main Courses', icon: 'fas fa-utensils' },
  { id: 2, name: 'Desserts', icon: 'fas fa-ice-cream' },
  { id: 3, name: 'Breakfast', icon: 'fas fa-coffee' },
  { id: 4, name: 'Appetizers', icon: 'fas fa-cheese' },
  { id: 5, name: 'Side Dishes', icon: 'fas fa-carrot' },
  { id: 6, name: 'Salads', icon: 'fas fa-leaf' },
  { id: 7, name: 'Soups', icon: 'fas fa-mug-hot' },
  { id: 8, name: 'Baking', icon: 'fas fa-bread-slice' },
  { id: 9, name: 'Drinks', icon: 'fas fa-glass-martini-alt' },
  { id: 10, name: 'Sauces & Dips', icon: 'fas fa-mortar-pestle' }
]

const selectCategory = (categoryId: number | null) => {
  emit('select', categoryId)
  emit('close')
}
</script>

<style scoped>
.category-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.category-menu.show {
  opacity: 1;
  visibility: visible;
}

.category-menu-content {
  background-color: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.category-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-menu-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  background-color: #fff5f5;
  color: #ff5252;
}

.category-item i {
  margin-right: 8px;
  font-size: 1.1rem;
  color: #666;
}

.category-item:hover i {
  color: #ff5252;
}
</style>
