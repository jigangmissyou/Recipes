import api from './api'

export interface User {
  id: number
  nickname: string
  email: string
  phone: string | null
  avatar: string | null
  bio: string | null
  provider: string | null
  provider_id: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  created_at: string
  updated_at: string
  pivot: {
    recipe_id: number
    tag_id: number
  }
}

export interface Ingredient {
  id: number
  recipe_id: number
  name: string
  quantity: string
  unit: string
  created_at: string
  updated_at: string
}

export interface Step {
  id: number
  recipe_id: number
  step_order: number
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: number
  user_id: number
  category_id: number
  name: string
  slug: string
  description: string
  difficulty: string
  prep_time: string
  cook_time: string
  cover_image: string
  created_at: string
  updated_at: string
  user: {
    id: number
    nickname: string
    avatar: string | null
  }
  category: {
    id: number
    name: string
  }
  ingredients: Ingredient[]
  steps: Step[]
  tags: Tag[]
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: {
    url: string | null
    label: string
    active: boolean
  }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

export interface CreateRecipeData {
  category_id: number
  name: string
  description: string
  difficulty: string
  prep_time: string
  cook_time: string
  cover_image: string
  ingredients: {
    name: string
    quantity: string
    unit: string
    notes?: string
  }[]
  steps: {
    step_order: number
    description: string
    image_url?: string
  }[]
  tags: string[]
}

export interface Comment {
  id: number
  recipe_id: number
  user_id: number
  parent_id: number | null
  content: string
  created_at: string
  updated_at: string
  user: {
    id: number
    nickname: string
    avatar: string | null
  }
  replies: Comment[]
}

export const recipeService = {
  async getRecipes(params: { 
    page: number; 
    category_id?: number | null;
    tag_id?: number | null;
    search?: string | null;
  }): Promise<PaginatedResponse<Recipe>> {
    const queryParams = new URLSearchParams()
    queryParams.append('page', params.page.toString())
    if (params.category_id) {
      queryParams.append('category_id', params.category_id.toString())
    }
    if (params.tag_id) {
      queryParams.append('tag_id', params.tag_id.toString())
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }
    const response = await api.get(`/recipes?${queryParams.toString()}`)
    return response.data
  },
  // 获取我的菜谱
  async getMyRecipes(page: number = 1): Promise<PaginatedResponse<Recipe>> {
    const response = await api.get(`/recipes/my?page=${page}`)
    return response.data
  },


  // 创建菜谱
  async createRecipe(recipe: CreateRecipeData) {
    const response = await api.post('/recipes', recipe)
    return response.data
  },

  // 上传图片
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (!response.data || !response.data.image_url) {
      throw new Error('Invalid response from server: missing image URL')
    }
    return {
      url: response.data.image_url
    }
  },

  // 获取菜谱详情
  async getRecipeDetail(id: number): Promise<Recipe> {
    const response = await api.get(`/recipes/${id}`)
    return response.data
  },

  // 获取菜谱评论
  async getRecipeComments(recipeId: number, page: number = 1): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`/recipes/${recipeId}/comments?page=${page}`)
    return response.data
  },

  // 发表评论
  async createComment(recipeId: number, content: string, parentId: number | null = null): Promise<Comment> {
    const response = await api.post(`/recipes/${recipeId}/comments`, { 
      content,
      parent_id: parentId
    })
    return response.data
  },

  // 获取用户评论
  async getMyComments(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<Comment>> {
    const response = await api.get(`/my-comments?page=${page}&per_page=${perPage}`)
    return response.data
  },

  // 删除评论
  async deleteComment(recipeId: number, commentId: number): Promise<void> {
    await api.delete(`/recipes/${recipeId}/comments/${commentId}`)
  }
} 