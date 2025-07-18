export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      active_chats: {
        Row: {
          created_at: string
          id: string
          status: string
          user1: string
          user2: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user1: string
          user2: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user1?: string
          user2?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          guest_name: string
          id: string
          message: string
          sender_type: string
          timestamp: string
        }
        Insert: {
          guest_name: string
          id?: string
          message: string
          sender_type?: string
          timestamp?: string
        }
        Update: {
          guest_name?: string
          id?: string
          message?: string
          sender_type?: string
          timestamp?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes: number
          title: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number
          title: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes?: number
          title?: string
        }
        Relationships: []
      }
      muted_users: {
        Row: {
          id: string
          muted_by: string
          reason: string | null
          timestamp: string
          username: string
        }
        Insert: {
          id?: string
          muted_by: string
          reason?: string | null
          timestamp?: string
          username: string
        }
        Update: {
          id?: string
          muted_by?: string
          reason?: string | null
          timestamp?: string
          username?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          from_user: string
          id: string
          message: string
          read: boolean
          timestamp: string
          to_user: string
          type: string
        }
        Insert: {
          from_user: string
          id?: string
          message: string
          read?: boolean
          timestamp?: string
          to_user: string
          type: string
        }
        Update: {
          from_user?: string
          id?: string
          message?: string
          read?: boolean
          timestamp?: string
          to_user?: string
          type?: string
        }
        Relationships: []
      }
      post_dislikes: {
        Row: {
          id: string
          post_id: string
          timestamp: string
          user_name: string
        }
        Insert: {
          id?: string
          post_id: string
          timestamp?: string
          user_name: string
        }
        Update: {
          id?: string
          post_id?: string
          timestamp?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_dislikes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          timestamp: string
          user_name: string
        }
        Insert: {
          id?: string
          post_id: string
          timestamp?: string
          user_name: string
        }
        Update: {
          id?: string
          post_id?: string
          timestamp?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_name: string
          content: string
          dislikes: number
          id: string
          image_url: string | null
          likes: number
          timestamp: string
          title: string
        }
        Insert: {
          author_name: string
          content: string
          dislikes?: number
          id?: string
          image_url?: string | null
          likes?: number
          timestamp?: string
          title: string
        }
        Update: {
          author_name?: string
          content?: string
          dislikes?: number
          id?: string
          image_url?: string | null
          likes?: number
          timestamp?: string
          title?: string
        }
        Relationships: []
      }
      private_chats: {
        Row: {
          id: string
          message: string
          receiver_name: string
          sender_name: string
          timestamp: string
        }
        Insert: {
          id?: string
          message: string
          receiver_name: string
          sender_name: string
          timestamp?: string
        }
        Update: {
          id?: string
          message?: string
          receiver_name?: string
          sender_name?: string
          timestamp?: string
        }
        Relationships: []
      }
      public_chat: {
        Row: {
          id: string
          message: string
          sender_name: string
          timestamp: string
        }
        Insert: {
          id?: string
          message: string
          sender_name: string
          timestamp?: string
        }
        Update: {
          id?: string
          message?: string
          sender_name?: string
          timestamp?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_response: string | null
          admin_response_timestamp: string | null
          description: string
          guest_name: string
          id: string
          screenshot_url: string | null
          status: string | null
          timestamp: string
          type: string
        }
        Insert: {
          admin_response?: string | null
          admin_response_timestamp?: string | null
          description: string
          guest_name: string
          id?: string
          screenshot_url?: string | null
          status?: string | null
          timestamp?: string
          type: string
        }
        Update: {
          admin_response?: string | null
          admin_response_timestamp?: string | null
          description?: string
          guest_name?: string
          id?: string
          screenshot_url?: string | null
          status?: string | null
          timestamp?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
