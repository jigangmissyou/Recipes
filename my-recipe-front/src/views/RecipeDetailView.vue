<template>
  <div class="recipe-detail">
    <!-- 顶部导航栏 -->
    <nav class="navbar navbar-light top-nav fixed-top">
      <div class="container-fluid d-flex align-items-center">
        <button class="btn-nav" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h5 class="mb-0">{{ recipe?.name }}</h5>
        <div class="nav-actions">
          <!-- <button class="btn-icon" @click="toggleLike">
            <i class="fas" :class="isLiked ? 'fa-heart text-danger' : 'fa-heart'"></i>
          </button> -->
          <button class="btn-icon" @click="toggleBookmark">
            <i class="fas" :class="isBookmarked ? 'fa-bookmark text-primary' : 'fa-bookmark'"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div v-if="loading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="recipe" class="container">
        <!-- 封面图片 -->
        <div class="cover-image">
          <img :src="recipe.cover_image" :alt="recipe.name">
        </div>
        <div class="recipe-stats">
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>Prep: {{ recipe.prep_time }} mins</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-fire"></i>
              <span>Cook: {{ recipe.cook_time }} mins</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-signal"></i>
              <span>{{ recipe.difficulty }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-user"></i>
              <span>By {{ recipe.user.nickname }}</span>
            </div>
          </div>
        <!-- 基本信息 -->
        <div class="recipe-info">
          <div class="recipe-header">
            <!-- <h1 class="recipe-title">{{ recipe.name }}</h1> -->
            <p class="recipe-description">{{ recipe.description }}</p>
          </div>

          

          <!-- <div class="btn-group">
            <button class="btn btn-like" @click="toggleLike">
              <i class="fas fa-heart"></i> {{ recipe.likes }}
            </button>
            <button class="btn btn-like" @click="showComments">
              <i class="fas fa-comment"></i> {{ recipe.comments?.length || 0 }}
            </button>
          </div> -->
        </div>

        <!-- 食材清单 -->
        <div class="recipe-section">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            <li v-for="ingredient in recipe.ingredients" :key="ingredient.id" class="ingredient-item">
              <div class="ingredient-info">
                <span class="ingredient-name">{{ ingredient.name }}</span>
                <span class="ingredient-quantity">
                  {{ ingredient.quantity }} {{ ingredient.unit }}
                </span>
              </div>
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
                <img :src="step.image_url" :alt="`Step ${index + 1}`" class="step-image">
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 添加分类和标签部分 -->
        <div class="recipe-meta-section">
          <div class="category-section">
            <h4>Category</h4>
            <span class="category-tag">{{ recipe.category.name }}</span>
          </div>
          
          <div class="tags-section" v-if="recipe.tags && recipe.tags.length > 0">
            <h4>Tags</h4>
            <div class="tags-list">
              <span v-for="tag in recipe.tags" :key="tag.id" class="tag-item">
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- 评论预览 -->
        <div class="comments-preview" v-if="recipe?.comments?.length > 0">
          <h4>Comments</h4>
          <div class="comments-container">
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
    <div class="comment-bar" v-if="recipe && !isCommentsModalVisible">
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
import { recipeService } from '../services/recipe'

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
const fetchRecipeDetail = async () => {
  try {
    loading.value = true
    const id = Number(route.params.id)
    const recipeData = await recipeService.getRecipeDetail(id)
    
    // 添加模拟评论数据
    recipeData.comments = [
      {
        author: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
        content: 'This recipe looks amazing! I can\'t wait to try it.',
        time: '2 hours ago',
        likes: 12,
        replies: [
          {
            author: 'Recipe Author',
            avatar: 'https://i.pravatar.cc/150?img=5',
            content: 'Thank you! Let me know how it turns out!',
            time: '1 hour ago',
            likes: 3
          }
        ]
      },
      {
        author: 'Jane Smith',
        avatar: 'https://i.pravatar.cc/150?img=2',
        content: 'I made this last night and it was delicious! The instructions were very clear.',
        time: '5 hours ago',
        likes: 8,
        replies: []
      },
      {
        author: 'Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=3',
        content: 'Great recipe! I added some extra spices and it turned out perfect.',
        time: '1 day ago',
        likes: 15,
        replies: []
      },
      {
        author: 'Sarah Wilson',
        avatar: 'https://i.pravatar.cc/150?img=4',
        content: 'The presentation is beautiful! What camera do you use for the photos?',
        time: '1 day ago',
        likes: 6,
        replies: [
          {
            author: 'Recipe Author',
            avatar: 'https://i.pravatar.cc/150?img=5',
            content: 'I use a Canon EOS R5 with a 50mm lens. Natural lighting works best!',
            time: '23 hours ago',
            likes: 4
          }
        ]
      },
      {
        author: 'David Brown',
        avatar: 'https://i.pravatar.cc/150?img=6',
        content: 'Can I substitute almond milk for regular milk?',
        time: '2 days ago',
        likes: 3,
        replies: [
          {
            author: 'Recipe Author',
            avatar: 'https://i.pravatar.cc/150?img=5',
            content: 'Yes, almond milk works great as a substitute!',
            time: '2 days ago',
            likes: 2
          }
        ]
      },
      {
        author: 'Emily Davis',
        avatar: 'https://i.pravatar.cc/150?img=7',
        content: 'I\'ve made this three times now. It\'s become a family favorite!',
        time: '2 days ago',
        likes: 9,
        replies: []
      },
      {
        author: 'Tom Anderson',
        avatar: 'https://i.pravatar.cc/150?img=8',
        content: 'The prep time seems a bit long. Any tips to make it faster?',
        time: '3 days ago',
        likes: 5,
        replies: [
          {
            author: 'Recipe Author',
            avatar: 'https://i.pravatar.cc/150?img=5',
            content: 'You can prepare the ingredients the night before to save time!',
            time: '3 days ago',
            likes: 7
          }
        ]
      },
      {
        author: 'Lisa Chen',
        avatar: 'https://i.pravatar.cc/150?img=9',
        content: 'Beautiful plating! The colors are so vibrant.',
        time: '3 days ago',
        likes: 11,
        replies: []
      },
      {
        author: 'Robert Taylor',
        avatar: 'https://i.pravatar.cc/150?img=10',
        content: 'I added some chili flakes for extra heat. Amazing!',
        time: '4 days ago',
        likes: 8,
        replies: []
      },
      {
        author: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?img=11',
        content: 'This is perfect for meal prep. How long does it keep in the fridge?',
        time: '4 days ago',
        likes: 4,
        replies: [
          {
            author: 'Recipe Author',
            avatar: 'https://i.pravatar.cc/150?img=5',
            content: 'It stays fresh for up to 4 days in an airtight container!',
            time: '4 days ago',
            likes: 3
          }
        ]
      },
      {
        author: 'James Wilson',
        avatar: 'https://i.pravatar.cc/150?img=12',
        content: 'The step-by-step photos are so helpful. Great job!',
        time: '5 days ago',
        likes: 7,
        replies: []
      },
      {
        author: 'Sophie Martin',
        avatar: 'https://i.pravatar.cc/150?img=13',
        content: 'I made this for a dinner party and everyone loved it!',
        time: '5 days ago',
        likes: 10,
        replies: []
      }
    ]
    
    recipe.value = recipeData
  } catch (error) {
    console.error('Failed to fetch recipe:', error)
    alert('获取菜谱详情失败，请重试')
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
  fetchRecipeDetail()
})
</script>

<style scoped>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';

.recipe-detail {
  padding-top: 56px;
}

.cover-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-info {
  padding: 0 15px;
  margin-bottom: 30px;
}

.recipe-header {
  margin-bottom: 20px;
  padding: 0 15px;
}

.recipe-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.3;
}

.recipe-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.recipe-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 14px;
}

.stat-item i {
  color: #ff5252;
  font-size: 16px;
}

.btn-group {
  display: flex;
  gap: 12px;
}

.btn-like {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-like:hover {
  background-color: #fff5f5;
  color: #ff5252;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-like i {
  font-size: 16px;
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
.ingredient-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.ingredient-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ingredient-name {
  font-weight: 500;
  color: #333;
}
.ingredient-quantity {
  color: #666;
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
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.comments-container {
  max-height: 400px;
  overflow-y: auto;
  padding-bottom: 80px; /* 为固定评论框留出空间 */
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
.btn-icon {
  background: none;
  border: none;
  color: #333;
  font-size: 20px;
  padding: 0;
}
.btn-icon:hover {
  color: #ff5252;
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
.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
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
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.load-more-btn:hover {
  background-color: #e9ecef;
  color: #333;
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
.recipe-meta-section {
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.category-section {
  margin-bottom: 20px;
}
.category-tag {
  background-color: #ff5252;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}
.tags-section {
  margin-bottom: 20px;
}
.tags-list {
  display: flex;
  gap: 10px;
}
.tag-item {
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
