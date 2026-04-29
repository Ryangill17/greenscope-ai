import type {
  AIAnalysis,
  CrewInstruction,
  EstimateLineItem,
  Job,
  JobFile,
  MaterialItem,
  Profile,
  Proposal
} from "@/lib/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Row<T> = T & Record<string, unknown>;
type Insert<T> = Partial<Row<T>>;

type Update<T> = Partial<Insert<T>>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Row<Profile>;
        Insert: Insert<Profile>;
        Update: Update<Profile>;
        Relationships: [];
      };
      jobs: {
        Row: Row<Job>;
        Insert: Insert<Job>;
        Update: Update<Job>;
        Relationships: [];
      };
      job_files: {
        Row: Row<JobFile>;
        Insert: Insert<JobFile>;
        Update: Update<JobFile>;
        Relationships: [];
      };
      ai_analyses: {
        Row: Row<AIAnalysis>;
        Insert: Insert<AIAnalysis>;
        Update: Update<AIAnalysis>;
        Relationships: [];
      };
      estimate_line_items: {
        Row: Row<EstimateLineItem>;
        Insert: Insert<EstimateLineItem>;
        Update: Update<EstimateLineItem>;
        Relationships: [];
      };
      proposals: {
        Row: Row<Proposal>;
        Insert: Insert<Proposal>;
        Update: Update<Proposal>;
        Relationships: [];
      };
      material_items: {
        Row: Row<MaterialItem>;
        Insert: Insert<MaterialItem>;
        Update: Update<MaterialItem>;
        Relationships: [];
      };
      crew_instructions: {
        Row: Row<CrewInstruction>;
        Insert: Insert<CrewInstruction>;
        Update: Update<CrewInstruction>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
