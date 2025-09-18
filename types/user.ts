export interface UserProfile {
  full_name: string | null
  display_name: string | null
  school: string | null
  academic_year: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'other' | null
}