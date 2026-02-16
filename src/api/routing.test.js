import { describe, it, expect } from 'vitest'
import { compareRoutes } from './routing'

describe('compareRoutes', () => {
  it('returns excellent rating for near-optimal route', () => {
    const result = compareRoutes(10, 9.8)
    expect(result.rating).toBe('excellent')
    expect(result.efficiency).toBeGreaterThanOrEqual(95)
  })

  it('returns poor rating for highly inefficient route', () => {
    const result = compareRoutes(20, 10)
    expect(result.rating).toBe('poor')
    expect(result.efficiency).toBe(50)
  })

  it('handles missing optimal distance safely', () => {
    const result = compareRoutes(10, 0)
    expect(result.efficiency).toBe(100)
    expect(result.rating).toBe('unknown')
  })
})
