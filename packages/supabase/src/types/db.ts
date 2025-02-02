export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competition_classes: {
        Row: {
          created_at: string
          id: number
          marathon_id: number
          name: string
          number_of_photos: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          name: string
          number_of_photos: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          marathon_id?: number
          name?: string
          number_of_photos?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_classes_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      demologs: {
        Row: {
          created_at: string
          id: number
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          type?: string
        }
        Relationships: []
      }
      device_groups: {
        Row: {
          created_at: string
          id: number
          marathon_id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          marathon_id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_groups_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      marathons: {
        Row: {
          created_at: string
          domain: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          created_at: string
          email: string | null
          id: number
          marathon_id: number
          reference: string
          status: string
          updated_at: string
          upload_count: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          marathon_id: number
          reference: string
          status?: string
          updated_at: string
          upload_count?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          marathon_id?: number
          reference?: string
          status?: string
          updated_at?: string
          upload_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "participants_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_errors: {
        Row: {
          context: Json | null
          created_at: string
          description: string | null
          error_code: string
          id: number
          message: string
          severity: string
          submission_id: number | null
          submission_key: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          description?: string | null
          error_code: string
          id?: number
          message: string
          severity?: string
          submission_id?: number | null
          submission_key?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          description?: string | null
          error_code?: string
          id?: number
          message?: string
          severity?: string
          submission_id?: number | null
          submission_key?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          exif: Json | null
          id: number
          image_key: string
          marathon_id: number
          participant_id: number
          preview_key: string | null
          status: Database["public"]["Enums"]["upload_status"]
          thumbnail_key: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          exif?: Json | null
          id?: number
          image_key: string
          marathon_id: number
          participant_id: number
          preview_key?: string | null
          status?: Database["public"]["Enums"]["upload_status"]
          thumbnail_key?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          exif?: Json | null
          id?: number
          image_key?: string
          marathon_id?: number
          participant_id?: number
          preview_key?: string | null
          status?: Database["public"]["Enums"]["upload_status"]
          thumbnail_key?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          id: number
          marathon_id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          marathon_id: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          marathon_id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_marathon_id_fkey"
            columns: ["marathon_id"]
            isOneToOne: false
            referencedRelation: "marathons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_upload_counter: {
        Args: {
          participant_id: number
          total_expected: number
        }
        Returns: Json
      }
    }
    Enums: {
      upload_status: "initialized" | "processing" | "error" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
