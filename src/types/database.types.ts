export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          id: string
          metadata: Json | null
          occurred_at: string
          subject_id: string
          subject_label: string
          subject_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          subject_id: string
          subject_label: string
          subject_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          subject_id?: string
          subject_label?: string
          subject_type?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          biography: string | null
          created_at: string
          created_by_user_id: string | null
          date_of_birth: string | null
          date_of_death: string | null
          display_name: string
          family_name: string
          given_name: string
          id: string
          is_deceased: boolean
          preferred_name: string | null
          source_type: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          created_by_user_id?: string | null
          date_of_birth?: string | null
          date_of_death?: string | null
          display_name: string
          family_name: string
          given_name: string
          id?: string
          is_deceased?: boolean
          preferred_name?: string | null
          source_type: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          created_by_user_id?: string | null
          date_of_birth?: string | null
          date_of_death?: string | null
          display_name?: string
          family_name?: string
          given_name?: string
          id?: string
          is_deceased?: boolean
          preferred_name?: string | null
          source_type?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      profile_claims: {
        Row: {
          claimant_user_id: string
          claimed_person_id: string
          created_at: string
          decided_at: string | null
          decision_notes: string | null
          id: string
          reviewer_admin_id: string | null
          status: string
          submitted_at: string
          supporting_evidence: string | null
          updated_at: string
        }
        Insert: {
          claimant_user_id: string
          claimed_person_id: string
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          id?: string
          reviewer_admin_id?: string | null
          status?: string
          submitted_at?: string
          supporting_evidence?: string | null
          updated_at?: string
        }
        Update: {
          claimant_user_id?: string
          claimed_person_id?: string
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          id?: string
          reviewer_admin_id?: string | null
          status?: string
          submitted_at?: string
          supporting_evidence?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_claims_claimed_person_id_fkey"
            columns: ["claimed_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewers: {
        Row: {
          created_at: string
          granted_at: string
          granted_by_user_id: string | null
          id: string
          revoked_at: string | null
          revoked_by_user_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by_user_id?: string | null
          id?: string
          revoked_at?: string | null
          revoked_by_user_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by_user_id?: string | null
          id?: string
          revoked_at?: string | null
          revoked_by_user_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_person_links: {
        Row: {
          created_at: string
          id: string
          linked_at: string
          linked_by_user_id: string | null
          person_id: string
          revoked_at: string | null
          revoked_reason: string | null
          source_claim_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_at?: string
          linked_by_user_id?: string | null
          person_id: string
          revoked_at?: string | null
          revoked_reason?: string | null
          source_claim_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_at?: string
          linked_by_user_id?: string | null
          person_id?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          source_claim_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_person_links_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_links_source_claim_id_fkey"
            columns: ["source_claim_id"]
            isOneToOne: false
            referencedRelation: "profile_claims"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      am_i_a_reviewer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      approve_profile_claim: {
        Args: { p_claim_id: string }
        Returns: {
          id: string
          status: string
          decided_at: string
          link_id: string
        }[]
      }
      begin_claim_review: {
        Args: { p_claim_id: string }
        Returns: {
          id: string
          status: string
        }[]
      }
      get_claim_review_detail: {
        Args: { p_claim_id: string }
        Returns: {
          id: string
          status: string
          claimant_email: string | null
          person_id: string
          person_display_name: string
          person_given_name: string
          person_family_name: string
          person_verification_status: string
          person_source_type: string
          person_created_at: string
          supporting_evidence: string | null
          submitted_at: string
          decided_at: string | null
          reviewer_email: string | null
          decision_notes: string | null
          active_link_exists: boolean
        }[]
      }
      get_claimed_person_display_name: {
        Args: { p_person_id: string }
        Returns: string | null
      }
      is_person_claimable: {
        Args: { p_person_id: string }
        Returns: boolean
      }
      list_claims_for_review: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          status: string
          claimant_email: string | null
          person_id: string
          person_display_name: string
          person_verification_status: string
          submitted_at: string
        }[]
      }
      reject_profile_claim: {
        Args: { p_claim_id: string; p_decision_notes?: string | null }
        Returns: {
          id: string
          status: string
          decided_at: string
        }[]
      }
      search_claimable_people: {
        Args: { p_query?: string | null }
        Returns: {
          id: string
          display_name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "people"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      submit_profile_claim: {
        Args: { p_person_id: string; p_supporting_evidence?: string | null }
        Returns: {
          id: string
          status: string
          submitted_at: string
        }[]
      }
      withdraw_profile_claim: {
        Args: { p_claim_id: string }
        Returns: {
          claimant_user_id: string
          claimed_person_id: string
          created_at: string
          decided_at: string | null
          decision_notes: string | null
          id: string
          reviewer_admin_id: string | null
          status: string
          submitted_at: string
          supporting_evidence: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profile_claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

