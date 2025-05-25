import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'not-a-label',
    },
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  artist_name?: string;
  role: string;
  profile_image?: string;
  bio?: string;
  genres?: string[];
  social_links?: Record<string, string>;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  file_url: string;
  cover_url?: string;
  waveform_data?: any;
  metadata?: Record<string, any>;
  play_count: number;
  like_count: number;
  status: string;
  release_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  user_id: string;
  track_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  created_at: string;
}

export interface Distribution {
  id: string;
  track_id: string;
  platform: string;
  status: string;
  platform_id?: string;
  url?: string;
  metadata?: Record<string, any>;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  user_id: string;
  track_id?: string;
  amount: number;
  currency: string;
  source: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

// Helper functions for database operations
export const db = {
  users: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as User;
    },
    
    async update(id: string, updates: Partial<User>) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    },
  },
  
  tracks: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Track[];
    },
    
    async create(track: Omit<Track, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('tracks')
        .insert(track)
        .select()
        .single();
      
      if (error) throw error;
      return data as Track;
    },
    
    async update(id: string, updates: Partial<Track>) {
      const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Track;
    },
    
    async delete(id: string) {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },
  
  analytics: {
    async track(event: Omit<Analytics, 'id' | 'created_at'>) {
      const { error } = await supabase
        .from('analytics')
        .insert(event);
      
      if (error) throw error;
    },
    
    async getByUserId(userId: string, startDate?: Date, endDate?: Date) {
      let query = supabase
        .from('analytics')
        .select('*')
        .eq('user_id', userId);
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Analytics[];
    },
  },
  
  revenue: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('revenue')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Revenue[];
    },
    
    async getTotalByUserId(userId: string) {
      const { data, error } = await supabase
        .from('revenue')
        .select('amount')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data.reduce((total, item) => total + item.amount, 0);
    },
  },
};