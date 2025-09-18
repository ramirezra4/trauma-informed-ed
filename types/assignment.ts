export interface Assignment {
  id: string
  user_id: string
  course: string
  title: string
  description: string | null
  due_at: string
  impact: number
  est_minutes: number
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped'
  created_at: string
  updated_at: string
}