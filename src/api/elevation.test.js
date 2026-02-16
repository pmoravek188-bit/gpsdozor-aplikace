import { describe, it, expect } from 'vitest'
import { getElevationStats } from './elevation'

describe('getElevationStats', () => {
  it('returns null for empty profile', () => {
    expect(getElevationStats([])).toBeNull()
  })

  it('calculates min/max/ascent/descent correctly', () => {
    const profile = [
      { elevation: 200 },
      { elevation: 250 },
      { elevation: 230 },
      { elevation: 280 },
      { elevation: 240 },
    ]

    const stats = getElevationStats(profile)
    expect(stats.min).toBe(200)
    expect(stats.max).toBe(280)
    expect(stats.totalAscent).toBe(100) // +50 +50
    expect(stats.totalDescent).toBe(60) // -20 -40
  })
})
