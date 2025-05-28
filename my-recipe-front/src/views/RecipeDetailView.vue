<template>
  <div>
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-light top-nav fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <button class="btn-nav" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="ms-auto d-flex gap-2">
          <button class="btn-nav">
            <i class="fas fa-share-alt"></i>
          </button>
          <button class="btn-nav">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading recipe...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">An error occurred while loading the recipe.</p>
      <button class="btn btn-primary" @click="goBack">Go Back</button>
    </div>

    <!-- 菜谱详情内容 -->
    <div v-else-if="recipe" class="recipe-content">
      <div class="recipe-header">
        <img :src="recipe.image" :alt="recipe.title">
        <div class="recipe-header-overlay">
          <h2>{{ recipe.title }}</h2>
          <div class="recipe-stats">
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>{{ recipe.cookingTime }} mins</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-fire"></i>
              <span>{{ recipe.calories }} cal</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-user"></i>
              <span>By {{ recipe.author }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- 点赞和评论按钮 -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="btn-group">
            <button class="btn btn-like" @click="toggleLike">
              <i class="fas fa-heart"></i> {{ recipe.likes }}
            </button>
            <button class="btn btn-like" @click="showComments">
              <i class="fas fa-comment"></i> {{ recipe.comments?.length || 0 }}
            </button>
          </div>
          <button class="btn btn-primary">
            <i class="fas fa-utensils"></i> Start Cooking
          </button>
        </div>

        <!-- 食材列表 -->
        <div class="ingredients-section">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
              <i class="fas fa-circle"></i>
              {{ ingredient }}
            </li>
          </ul>
        </div>

        <!-- 烹饪步骤 -->
        <div class="steps-section">
          <h3>Cooking Steps</h3>
          <div class="steps-list">
            <div v-for="(step, index) in recipe.steps" :key="index" class="step-item">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <img :src="step.image" :alt="`Step ${index + 1}`" class="step-image">
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论预览 -->
        <div class="comments-preview" v-if="recipe?.comments?.length > 0">
          <h4>Comments</h4>
          <div class="comment-item" v-for="comment in displayedComments" :key="comment.author">
            <div class="comment-header">
              <img :src="comment.avatar" :alt="comment.author" class="comment-avatar">
              <div>
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
            <div class="comment-actions">
              <button @click="likeComment(comment)">
                <i class="fas fa-heart"></i> {{ comment.likes }}
              </button>
              <button @click="handleReply(comment, false)">
                <i class="fas fa-reply"></i> Reply
              </button>
            </div>
          </div>
          <button v-if="recipe.comments.length > 2" class="load-more-btn" @click="showComments">
            Load More Comments
          </button>
        </div>
      </div>
    </div>

    <!-- 评论弹出层 -->
    <div class="comments-modal" :class="{ show: isCommentsModalVisible }" v-if="recipe">
      <div class="comments-modal-header">
        <h5>Comments</h5>
        <button class="btn-close" @click="closeComments">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="comments-modal-body">
        <div class="comment-item" v-for="comment in recipe.comments" :key="comment.author">
          <div class="comment-header">
            <img :src="comment.avatar" :alt="comment.author" class="comment-avatar">
            <div>
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <button @click="likeComment(comment)">
              <i class="fas fa-heart"></i> {{ comment.likes }}
            </button>
            <button @click="handleReply(comment, true)">
              <i class="fas fa-reply"></i> Reply
            </button>
          </div>
        </div>
      </div>
      <!-- 弹出层内的评论输入框 -->
      <div class="comments-modal-footer">
        <div class="comment-input-area">
          <button class="btn-emoji" @click="toggleEmojiPicker">
            <i class="far fa-smile"></i>
          </button>
          <input 
            type="text" 
            class="comment-input" 
            v-model="newComment" 
            :placeholder="replyTo ? `Reply to ${replyTo.author}...` : 'Write a comment...'"
            @keyup.enter="submitComment"
          >
          <button class="btn-send" @click="submitComment" :disabled="!newComment.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <!-- 表情选择器 -->
        <div class="emoji-picker" v-if="showEmojiPicker">
          <div class="emoji-list">
            <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">
              {{ emoji }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定的底部评论栏 -->
    <div class="fixed-comment-bar" v-if="recipe && !isCommentsModalVisible">
      <div class="comment-input-area">
        <button class="btn-emoji" @click="toggleEmojiPicker">
          <i class="far fa-smile"></i>
        </button>
        <input 
          type="text" 
          class="comment-input" 
          v-model="newComment" 
          :placeholder="replyTo ? `Reply to ${replyTo.author}...` : 'Write a comment...'"
          @keyup.enter="submitComment"
        >
        <button class="btn-send" @click="submitComment" :disabled="!newComment.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      <!-- 表情选择器 -->
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-list">
          <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const recipe = ref(null)
const loading = ref(true)
const error = ref(false)

// 评论相关状态
const isCommentsModalVisible = ref(false)
const newComment = ref('')
const showEmojiPicker = ref(false)
const replyTo = ref(null)

// 表情符号列表
const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😋', '👏', '🙌', '🤔']

// 显示的评论数量
const displayedComments = computed(() => {
  return recipe.value?.comments?.slice(0, 2) || []
})

// 获取食谱详情
const fetchRecipeDetails = async () => {
  loading.value = true
  error.value = false
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    recipe.value = {
      id: route.params.id,
      title: "Classic Chocolate Cake",
      author: "John Doe",
      cookingTime: "45 mins",
      calories: "350 kcal",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
      likes: 128,
      isLiked: false,
      ingredients: [
        "2 cups all-purpose flour",
        "2 cups sugar",
        "3/4 cup unsweetened cocoa powder",
        "2 teaspoons baking powder",
        "1 1/2 teaspoons baking soda",
        "1 teaspoon salt",
        "1 cup milk",
        "1/2 cup vegetable oil",
        "2 large eggs",
        "2 teaspoons vanilla extract",
        "1 cup boiling water"
      ],
      steps: [
        {
          description: "Preheat oven to 350°F (175°C). Grease and flour two 9-inch round cake pans.",
          image: "https://picsum.photos/800/600?random=1"
        },
        {
          description: "In a large bowl, mix together flour, sugar, cocoa powder, baking powder, baking soda, and salt.",
          image: "https://picsum.photos/800/600?random=2"
        },
        {
          description: "Add eggs, milk, oil, and vanilla extract. Beat on medium speed for 2 minutes.",
          image: "https://picsum.photos/800/600?random=3"
        },
        {
          description: "Stir in boiling water. The batter will be thin, but that's okay.",
          image: "https://picsum.photos/800/600?random=4"
        },
        {
          description: "Pour batter into prepared pans. Bake for 30-35 minutes or until a toothpick inserted in the center comes out clean.",
          image: "https://picsum.photos/800/600?random=5"
        }
      ],
      comments: [
        {
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          author: "John",
          time: "2 hours ago",
          content: "Looks delicious! Can't wait to try it.",
          likes: 12
        },
        {
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          author: "Anna",
          time: "1 hour ago",
          content: "My kids loved it, thank you!",
          likes: 8
        },
        {
          avatar: "https://randomuser.me/api/portraits/men/45.jpg",
          author: "Mike",
          time: "30 minutes ago",
          content: "Great recipe! I added some nuts and it was perfect.",
          likes: 5
        },
        {
          avatar: "https://randomuser.me/api/portraits/women/22.jpg",
          author: "Sarah",
          time: "15 minutes ago",
          content: "The cake was so moist and delicious!",
          likes: 3
        }
      ]
    }
  } catch (err) {
    error.value = true
    console.error('Error fetching recipe:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => window.history.back()

const toggleLike = () => {
  recipe.value.likes++
}

const showComments = () => {
  isCommentsModalVisible.value = true
  showEmojiPicker.value = false
  replyTo.value = null
}

const closeComments = () => {
  isCommentsModalVisible.value = false
  showEmojiPicker.value = false
  replyTo.value = null
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji) => {
  newComment.value += emoji
}

const submitComment = () => {
  if (!newComment.value.trim()) return

  const comment = {
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    author: 'Current User',
    time: 'Just now',
    content: newComment.value,
    likes: 0
  }

  recipe.value.comments.unshift(comment)
  newComment.value = ''
  showEmojiPicker.value = false
  replyTo.value = null
}

const handleReply = (comment, isInModal) => {
  replyTo.value = comment
  newComment.value = `@${comment.author} `
  if (!isInModal) {
    // 在预览中回复，需要打开弹出层
    isCommentsModalVisible.value = true
  }
  showEmojiPicker.value = false
}

const likeComment = (comment) => {
  comment.likes++
}

onMounted(() => {
  fetchRecipeDetails()
})
</script>

<style scoped>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';

.recipe-detail {
  padding-top: 56px;
}
.recipe-header {
  position: relative;
  height: 300px;
  overflow: hidden;
}
.recipe-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.recipe-header-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}
.recipe-stats {
  display: flex;
  gap: 15px;
  margin: 15px 0;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}
.ingredients-section {
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ingredients-list li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ingredients-list li:last-child {
  border-bottom: none;
}
.ingredients-list li i {
  color: #ff6b6b;
  font-size: 8px;
}
.steps-section {
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.steps-list {
  margin-bottom: 20px;
}
.step-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}
.step-number {
  width: 30px;
  height: 30px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}
.step-content {
  flex: 1;
}
.step-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.step-content p {
  margin: 0;
  line-height: 1.5;
  color: #333;
}
.comments-preview {
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0 80px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.comment-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.comment-author {
  font-weight: 600;
  margin-right: 10px;
}
.comment-time {
  color: #666;
  font-size: 12px;
}
.comment-content {
  margin-bottom: 10px;
  padding-left: 50px;
}
.comment-actions {
  display: flex;
  gap: 15px;
  padding-left: 50px;
  color: #666;
  font-size: 14px;
}
.comment-actions button {
  background: none;
  border: none;
  color: #ff5252;
  padding: 0;
  transition: color 0.2s;
}
.comment-actions button:hover {
  color: #ff3333;
}
.btn-nav {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 0 10px 0 0;
}
.btn-like {
  color: #ff5252;
  border: 1px solid #ff5252;
  background: white;
  margin-right: 8px;
  border-radius: 20px;
  padding: 4px 16px;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}
.btn-like:hover {
  background: #ff5252;
  color: white;
}
.btn-primary {
  background-color: #ff5252;
  border-color: #ff5252;
  border-radius: 20px;
  padding: 6px 20px;
  font-size: 14px;
}
.btn-primary:hover {
  background-color: #ff3333;
  border-color: #ff3333;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff5252;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
  text-align: center;
}
.error-text {
  color: #ff5252;
  margin-bottom: 15px;
}
.fixed-comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 100;
  margin-bottom: 20px;
}
.comment-input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}
.btn-emoji {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.comment-input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  outline: none;
}
.comment-input:focus {
  border-color: #ff5252;
}
.btn-send {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.btn-send:disabled {
  color: #ccc;
  cursor: not-allowed;
}
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}
.emoji-list span {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 5px;
}
.emoji-list span:hover {
  background: #f8f9fa;
  border-radius: 5px;
}
.load-more-btn {
  display: block;
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  text-align: center;
  color: #ff5252;
  background: #fff;
  border: 1px solid #ff5252;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}
.load-more-btn:hover {
  background: #ff5252;
  color: white;
}
.comments-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75vh;
  background: white;
  border-radius: 20px 20px 0 0;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.comments-modal.show {
  transform: translateY(0);
}
.comments-modal-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.comments-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  padding-bottom: 100px;
}
.comments-modal-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  border-top: 1px solid #eee;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.btn-close {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
}
.recipe-content {
  padding-bottom: 100px;
}
</style>
