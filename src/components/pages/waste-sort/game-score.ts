import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type GameScore = {
  accuracy: number
  correctCount: number
  employeeId: string
  mode: 'challenge' | 'learn' | 'practice'
  playedAt: string
  score: number
  sortedCount: number
}

export type SaveGameScoreInput = Pick<
  GameScore,
  'correctCount' | 'employeeId' | 'mode' | 'score' | 'sortedCount'
>

const GAME_SCORES_QUERY_KEY = ['waste-sort-scores'] as const

export function useGameScores() {
  return useQuery({
    queryFn: getGameScores,
    queryKey: GAME_SCORES_QUERY_KEY,
    staleTime: 15_000,
  })
}

export function useSaveGameScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveGameScore,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: GAME_SCORES_QUERY_KEY }),
  })
}

async function getGameScores() {
  return request<GameScore[]>('/api/game-scores')
}

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const body = (await response.json()) as { error?: string } | T

  if (!response.ok) {
    const message =
      'error' in (body as { error?: string })
        ? (body as { error?: string }).error
        : undefined
    throw new Error(message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อตารางคะแนน')
  }

  return body as T
}

async function saveGameScore(score: SaveGameScoreInput) {
  return request<GameScore>('/api/game-scores', {
    body: JSON.stringify(score),
    method: 'POST',
  })
}
