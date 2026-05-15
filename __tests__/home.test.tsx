import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('Home Page', () => {
  it('renders the home page', () => {
    render(<Home />)
    // Add assertions based on your page content
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
