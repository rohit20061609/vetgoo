# Testing Setup Guide

This project now includes comprehensive testing setup with both unit tests and E2E tests.

## Unit Tests (Jest + React Testing Library)

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Writing Unit Tests

Create test files in the `__tests__` directory or alongside your components with `.test.tsx` or `.spec.tsx` extension.

**Example test structure:**

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Test Configuration

- **Config file:** `jest.config.js`
- **Setup file:** `jest.setup.js` (loads @testing-library/jest-dom)
- **Test directory:** `__tests__/`
- **Module aliases:** All `@/*` paths are supported

## E2E Tests (Playwright)

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### Writing E2E Tests

Create test files in the `e2e` directory with `.spec.ts` extension.

**Example E2E test structure:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Page Title', () => {
  test('should load the page', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveTitle(/Dashboard/)
  })

  test('should interact with elements', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('button:has-text("Submit")')
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
```

### Test Configuration

- **Config file:** `playwright.config.ts`
- **Test directory:** `e2e/`
- **Base URL:** http://localhost:3000
- **Browsers:** Chrome, Firefox, Safari (+ mobile variants)

## Test Coverage

To see test coverage report:

```bash
npm run test:coverage
```

Coverage files are generated in the `coverage/` directory.

## CI/CD Integration

For continuous integration, you can use:

```bash
# Run all tests (useful in CI pipelines)
npm run lint && npm run test && npm run test:e2e
```

## Tips

- Use `test.only()` to run a single test during development
- Use `test.skip()` to skip tests
- Mock external dependencies and API calls
- Keep tests focused and isolated
- Write tests that verify behavior, not implementation details

## Resources

- [Jest Documentation](https://jestjs.io)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Testing](https://playwright.dev/docs/intro)
