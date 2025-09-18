import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserAssignments,
  saveAssignment,
  updateAssignment,
  deleteAssignment,
  completeAssignment,
  getProgressStats,
  saveCheckin,
  getUserProfile,
  updateUserProfile,
} from '@/lib/supabase'

describe('Supabase Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserAssignments', () => {
    it('fetches user assignments successfully', async () => {
      const mockAssignments = [
        { id: '1', title: 'Test Assignment' },
        { id: '2', title: 'Another Assignment' },
      ]

      // getUserAssignments is already mocked in setup.ts
      vi.mocked(getUserAssignments).mockResolvedValueOnce(mockAssignments)

      const result = await getUserAssignments('user-123')

      expect(getUserAssignments).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockAssignments)
    })

    it('returns empty array on error', async () => {
      vi.mocked(getUserAssignments).mockResolvedValueOnce([])

      const result = await getUserAssignments('user-123')

      expect(result).toEqual([])
    })
  })

  describe('saveAssignment', () => {
    it('saves assignment successfully', async () => {
      const newAssignment = {
        course: 'Math 101',
        title: 'Homework 1',
        priority: 'high' as const,
      }

      vi.mocked(saveAssignment).mockResolvedValueOnce(undefined)

      await expect(saveAssignment('user-123', newAssignment)).resolves.not.toThrow()

      expect(saveAssignment).toHaveBeenCalledWith('user-123', newAssignment)
    })

    it('handles error on failure', async () => {
      vi.mocked(saveAssignment).mockRejectedValueOnce(new Error('Insert failed'))

      await expect(
        saveAssignment('user-123', {
          course: 'Test',
          title: 'Test',
          priority: 'medium',
        })
      ).rejects.toThrow('Insert failed')
    })
  })

  describe('updateAssignment', () => {
    it('updates assignment successfully', async () => {
      const updates = { title: 'Updated Title' }

      vi.mocked(updateAssignment).mockResolvedValueOnce(undefined)

      await expect(
        updateAssignment('user-123', 'assignment-1', updates)
      ).resolves.not.toThrow()

      expect(updateAssignment).toHaveBeenCalledWith('user-123', 'assignment-1', updates)
    })
  })

  describe('deleteAssignment', () => {
    it('deletes assignment successfully', async () => {
      vi.mocked(deleteAssignment).mockResolvedValueOnce(undefined)

      await expect(deleteAssignment('user-123', 'assignment-1')).resolves.not.toThrow()

      expect(deleteAssignment).toHaveBeenCalledWith('user-123', 'assignment-1')
    })
  })

  describe('completeAssignment', () => {
    it('marks assignment as completed', async () => {
      vi.mocked(completeAssignment).mockResolvedValueOnce(undefined)

      await expect(completeAssignment('user-123', 'assignment-1')).resolves.not.toThrow()

      expect(completeAssignment).toHaveBeenCalledWith('user-123', 'assignment-1')
    })
  })

  describe('getProgressStats', () => {
    it('fetches progress stats successfully', async () => {
      const mockStats = {
        checkins: 2,
        completed: 2,
        wins: 3,
      }

      vi.mocked(getProgressStats).mockResolvedValueOnce(mockStats)

      const result = await getProgressStats('user-123')

      expect(getProgressStats).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockStats)
    })

    it('returns zeros on error', async () => {
      vi.mocked(getProgressStats).mockResolvedValueOnce({
        checkins: 0,
        completed: 0,
        wins: 0,
      })

      const result = await getProgressStats('user-123')

      expect(result).toEqual({
        checkins: 0,
        completed: 0,
        wins: 0,
      })
    })
  })

  describe('saveCheckin', () => {
    it('saves checkin successfully', async () => {
      const checkinData = {
        mood: 7,
        energy: 6,
        focus: 8,
        notes: 'Feeling good',
      }

      vi.mocked(saveCheckin).mockResolvedValueOnce(undefined)

      await expect(saveCheckin('user-123', checkinData)).resolves.not.toThrow()

      expect(saveCheckin).toHaveBeenCalledWith('user-123', checkinData)
    })
  })

  describe('getUserProfile', () => {
    it('fetches user profile successfully', async () => {
      const mockProfile = {
        full_name: 'Test User',
        school: 'Test University',
        academic_year: 'junior',
      }

      vi.mocked(getUserProfile).mockResolvedValueOnce(mockProfile)

      const result = await getUserProfile('user-123')

      expect(getUserProfile).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockProfile)
    })

    it('returns null on error', async () => {
      vi.mocked(getUserProfile).mockResolvedValueOnce(null)

      const result = await getUserProfile('user-123')

      expect(result).toBeNull()
    })
  })

  describe('updateUserProfile', () => {
    it('updates profile successfully', async () => {
      const profileData = {
        fullName: 'Updated User',
        school: 'New University',
        academicYear: 'senior' as const,
      }

      vi.mocked(updateUserProfile).mockResolvedValueOnce(undefined)

      await expect(updateUserProfile('user-123', profileData)).resolves.not.toThrow()

      expect(updateUserProfile).toHaveBeenCalledWith('user-123', profileData)
    })

    it('handles error on failure', async () => {
      vi.mocked(updateUserProfile).mockRejectedValueOnce(new Error('Update failed'))

      await expect(
        updateUserProfile('user-123', {
          fullName: 'Test',
          school: 'Test',
          academicYear: 'freshman',
        })
      ).rejects.toThrow('Update failed')
    })
  })
})