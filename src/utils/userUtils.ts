import { User } from '@supabase/supabase-js';
import { GoogleUser } from '@/services/googleAuth';

export function getUserDisplayName(user: User | GoogleUser | null): string {
  if (!user) return '';
  
  // Check if it's a Google user
  if ('name' in user) {
    return user.name;
  }
  
  // Supabase user
  return user.user_metadata?.full_name || user.email || '';
}

export function getUserEmail(user: User | GoogleUser | null): string {
  if (!user) return '';
  return user.email || '';
}

export function getUserAvatar(user: User | GoogleUser | null): string {
  if (!user) return '';
  
  // Check if it's a Google user
  if ('picture' in user) {
    return user.picture;
  }
  
  // Supabase user
  return user.user_metadata?.avatar_url || '';
}