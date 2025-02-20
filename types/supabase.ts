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
      receipts: {
        Row: {
          id: string
          user_id: string
          date: string
          total: number
          merchant: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total: number
          merchant: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total?: number
          merchant?: string
          created_at?: string
        }
      }
      receipt_items: {
        Row: {
          id: string
          receipt_id: string
          name: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          name: string
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          name?: string
          price?: number
          created_at?: string
        }
      }
    }
  }
}