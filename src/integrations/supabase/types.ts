export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      answer_keys: {
        Row: {
          expected_numeric: number | null
          expected_text: string | null
          id: string
          metric_key: string
          simulation_id: string
          tolerance_abs: number
          tolerance_pct: number
        }
        Insert: {
          expected_numeric?: number | null
          expected_text?: string | null
          id?: string
          metric_key: string
          simulation_id: string
          tolerance_abs?: number
          tolerance_pct?: number
        }
        Update: {
          expected_numeric?: number | null
          expected_text?: string | null
          id?: string
          metric_key?: string
          simulation_id?: string
          tolerance_abs?: number
          tolerance_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "answer_keys_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      career_paths: {
        Row: {
          created_at: string
          description: string
          id: string
          slug: string
          summary: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          slug: string
          summary: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      competencies: {
        Row: {
          career_path_id: string
          description: string
          id: string
          indicators: string[]
          position: number
          title: string
        }
        Insert: {
          career_path_id: string
          description: string
          id?: string
          indicators?: string[]
          position: number
          title: string
        }
        Update: {
          career_path_id?: string
          description?: string
          id?: string
          indicators?: string[]
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          checks: Json
          created_at: string
          criteria: Json
          error: string | null
          id: string
          model: string | null
          next_steps: Json
          overall_score: number | null
          status: string
          submission_id: string
          summary: string | null
          user_id: string
        }
        Insert: {
          checks?: Json
          created_at?: string
          criteria?: Json
          error?: string | null
          id?: string
          model?: string | null
          next_steps?: Json
          overall_score?: number | null
          status?: string
          submission_id: string
          summary?: string | null
          user_id: string
        }
        Update: {
          checks?: Json
          created_at?: string
          criteria?: Json
          error?: string | null
          id?: string
          model?: string | null
          next_steps?: Json
          overall_score?: number | null
          status?: string
          submission_id?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_entries: {
        Row: {
          competency_scores: Json
          created_at: string
          highlights: Json
          id: string
          is_public: boolean
          overall_score: number | null
          owner_name: string | null
          simulation_title: string | null
          submission_id: string | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          competency_scores?: Json
          created_at?: string
          highlights?: Json
          id?: string
          is_public?: boolean
          overall_score?: number | null
          owner_name?: string | null
          simulation_title?: string | null
          submission_id?: string | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          competency_scores?: Json
          created_at?: string
          highlights?: Json
          id?: string
          is_public?: boolean
          overall_score?: number | null
          owner_name?: string | null
          simulation_title?: string | null
          submission_id?: string | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_entries_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          course_of_study: string | null
          created_at: string
          full_name: string | null
          graduation_year: number | null
          id: string
          institution: string | null
          location: string | null
          onboarded_at: string | null
          target_career_path_id: string | null
          updated_at: string
        }
        Insert: {
          course_of_study?: string | null
          created_at?: string
          full_name?: string | null
          graduation_year?: number | null
          id: string
          institution?: string | null
          location?: string | null
          onboarded_at?: string | null
          target_career_path_id?: string | null
          updated_at?: string
        }
        Update: {
          course_of_study?: string | null
          created_at?: string
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          institution?: string | null
          location?: string | null
          onboarded_at?: string | null
          target_career_path_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_target_career_path_id_fkey"
            columns: ["target_career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_criteria: {
        Row: {
          competency_id: string | null
          description: string
          id: string
          position: number
          simulation_id: string
          title: string
          weight: number
        }
        Insert: {
          competency_id?: string | null
          description: string
          id?: string
          position: number
          simulation_id: string
          title: string
          weight: number
        }
        Update: {
          competency_id?: string | null
          description?: string
          id?: string
          position?: number
          simulation_id?: string
          title?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_criteria_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_metrics: {
        Row: {
          hint: string | null
          id: string
          kind: string
          label: string
          metric_key: string
          position: number
          simulation_id: string
        }
        Insert: {
          hint?: string | null
          id?: string
          kind?: string
          label: string
          metric_key: string
          position: number
          simulation_id: string
        }
        Update: {
          hint?: string | null
          id?: string
          kind?: string
          label?: string
          metric_key?: string
          position?: number
          simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_metrics_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_tasks: {
        Row: {
          id: string
          instructions: string
          position: number
          simulation_id: string
          title: string
        }
        Insert: {
          id?: string
          instructions: string
          position: number
          simulation_id: string
          title: string
        }
        Update: {
          id?: string
          instructions?: string
          position?: number
          simulation_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_tasks_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          business_problem: string
          career_path_id: string
          created_at: string
          dataset_description: string | null
          dataset_filename: string | null
          deliverables: string[]
          difficulty: string
          estimated_minutes: number
          id: string
          is_published: boolean
          organisation_background: string
          organisation_name: string
          responsibilities: string[]
          role_title: string
          slug: string
          title: string
        }
        Insert: {
          business_problem: string
          career_path_id: string
          created_at?: string
          dataset_description?: string | null
          dataset_filename?: string | null
          deliverables?: string[]
          difficulty: string
          estimated_minutes: number
          id?: string
          is_published?: boolean
          organisation_background: string
          organisation_name: string
          responsibilities?: string[]
          role_title: string
          slug: string
          title: string
        }
        Update: {
          business_problem?: string
          career_path_id?: string
          created_at?: string
          dataset_description?: string | null
          dataset_filename?: string | null
          deliverables?: string[]
          difficulty?: string
          estimated_minutes?: number
          id?: string
          is_published?: boolean
          organisation_background?: string
          organisation_name?: string
          responsibilities?: string[]
          role_title?: string
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_self_ratings: {
        Row: {
          competency_id: string
          id: string
          note: string | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          competency_id: string
          id?: string
          note?: string | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          competency_id?: string
          id?: string
          note?: string | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_self_ratings_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          answers: Json
          attempt_number: number
          created_at: string
          evidence_file_path: string | null
          evidence_url: string | null
          id: string
          metrics: Json
          simulation_id: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          evidence_file_path?: string | null
          evidence_url?: string | null
          id?: string
          metrics?: Json
          simulation_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          evidence_file_path?: string | null
          evidence_url?: string | null
          id?: string
          metrics?: Json
          simulation_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
