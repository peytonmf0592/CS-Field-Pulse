export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'field_rep' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'field_rep' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'field_rep' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      tours: {
        Row: {
          id: string
          name: string
          date: string
          field_rep_id: string
          location: string | null
          description: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          field_rep_id: string
          location?: string | null
          description?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          field_rep_id?: string
          location?: string | null
          description?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      engagements: {
        Row: {
          id: string
          tour_id: string
          participant_name: string
          participant_email: string | null
          participant_phone: string | null
          sentiment: 'promoter' | 'passive' | 'detractor'
          score: number
          participant_type: 'inspector' | 'adjuster' | 'other'
          notes: string | null
          voice_recording_url: string | null
          photo_url: string | null
          follow_up_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tour_id: string
          participant_name: string
          participant_email?: string | null
          participant_phone?: string | null
          sentiment: 'promoter' | 'passive' | 'detractor'
          score: number
          participant_type?: 'inspector' | 'adjuster' | 'other'
          notes?: string | null
          voice_recording_url?: string | null
          photo_url?: string | null
          follow_up_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tour_id?: string
          participant_name?: string
          participant_email?: string | null
          participant_phone?: string | null
          sentiment?: 'promoter' | 'passive' | 'detractor'
          score?: number
          participant_type?: 'inspector' | 'adjuster' | 'other'
          notes?: string | null
          voice_recording_url?: string | null
          photo_url?: string | null
          follow_up_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      follow_ups: {
        Row: {
          id: string
          engagement_id: string
          assigned_to: string
          status: 'pending' | 'in_progress' | 'completed'
          notes: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          assigned_to: string
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          assigned_to?: string
          status?: 'pending' | 'in_progress' | 'completed'
          notes?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_sentiment_summary: {
        Args: Record<string, never>
        Returns: {
          participant_type: 'inspector' | 'adjuster' | 'other'
          sentiment: 'promoter' | 'passive' | 'detractor'
          total: number
        }[]
      }
    }
    Enums: {
      user_role: 'admin' | 'field_rep' | 'viewer'
      tour_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
      sentiment_type: 'promoter' | 'passive' | 'detractor'
      follow_up_status: 'pending' | 'in_progress' | 'completed'
      participant_type: 'inspector' | 'adjuster' | 'other'
    }
  }
}
