import api from './api';

export interface Profile {
  id: number;
  nickname: string;
  avatar: string;
  bio: string;
  recipes: number;
  likes: number;
  comments: number;
}

export interface UpdateProfileData {
  nickname?: string;
  avatar?: string;
  bio?: string;
}

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}; 