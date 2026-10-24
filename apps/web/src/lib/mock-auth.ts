import type { AuthUser } from '@/interfaces/auth'

/**
 * Dev-only session handling until `/auth/login` and `/auth/me` exist on the API.
 * Mock tokens are recognized by their prefix and never hit the network.
 */
const MOCK_TOKEN_PREFIX = 'dev-session.'

export function createMockToken(username: string): string {
  return `${MOCK_TOKEN_PREFIX}${username}`
}

export function readMockUser(token: string): AuthUser | null {
  if (!token.startsWith(MOCK_TOKEN_PREFIX)) {
    return null
  }

  const sub = token.slice(MOCK_TOKEN_PREFIX.length)
  if (!sub) {
    return null
  }

  // Mock sessions are privileged on purpose so every dashboard page is reachable.
  return { sub, role: 'admin', permissions: [] }
}
