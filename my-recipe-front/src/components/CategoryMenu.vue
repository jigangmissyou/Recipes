<template>
  <div v-if="show" class="category-menu-overlay" @click="closeMenu">
    <div class="category-menu" @click.stop>
      <div class="category-header">
        <h2>Categories</h2>
        <button class="btn-close" @click="closeMenu">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="category-list">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          <i :class="category.icon"></i>
          <span>{{ category.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'select'])

const selectedCategory = ref(null)

const categories = [
  { id: 1, name: 'All', icon: 'fas fa-th-large' },
  { id: 2, name: 'Breakfast', icon: 'fas fa-coffee' },
  { id: 3, name: 'Lunch', icon: 'fas fa-utensils' },
  { id: 4, name: 'Dinner', icon: 'fas fa-moon' },
  { id: 5, name: 'Dessert', icon: 'fas fa-ice-cream' },
  { id: 6, name: 'Snacks', icon: 'fas fa-cookie' },
  { id: 7, name: 'Drinks', icon: 'fas fa-glass-martini-alt' },
  { id: 8, name: 'Vegetarian', icon: 'fas fa-leaf' },
  { id: 9, name: 'Vegan', icon: 'fas fa-seedling' },
  { id: 10, name: 'Gluten-Free', icon: 'fas fa-bread-slice' }
]

const closeMenu = () => {
  emit('close')
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  emit('select', categoryId)
  closeMenu()
}
</script>

<style scoped>
.category-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
}

.category-menu {
  width: 280px;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.category-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.btn-close:hover {
  color: #ff5252;
}

.category-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #333;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-item i {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.category-item:hover {
  background: #f8f9fa;
  color: #ff5252;
}

.category-item.active {
  background: #fff5f5;
  color: #ff5252;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .category-menu {
    width: 100%;
  }
}
</style>
