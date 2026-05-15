import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Testing Framework', () => {
  it('Jest is properly configured', () => {
    expect(true).toBe(true)
  })

  it('can perform basic assertions', () => {
    expect(1 + 1).toBe(2)
  })
})

