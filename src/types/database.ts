// Bu dosya `supabase gen types typescript` ile üretilecek.
// Faz 0'da sadece profiles tablosu var; şema büyüdükçe komutla yeniden üretilir.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          timezone: string;
          locale: string;
          bell_settings: Json;
          notification_prefs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          timezone?: string;
          locale?: string;
          bell_settings?: Json;
          notification_prefs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          timezone?: string;
          locale?: string;
          bell_settings?: Json;
          notification_prefs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
