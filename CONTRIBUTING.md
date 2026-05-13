# Contributing to VetGo

We appreciate your interest in contributing to VetGo! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Report issues professionally
- Follow project conventions

## Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/vetgo.git
cd vetgo
git remote add upstream https://github.com/original-repo/vetgo.git
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Install Dependencies
```bash
npm install
```

## Development Workflow

### Setup Development Environment
```bash
npm run dev
```

### Run Tests
```bash
npm run test
npm run test:e2e
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Build
```bash
npm run build
```

## Commit Guidelines

Follow conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: maintenance tasks
```

Example:
```bash
git commit -m "feat: add AI chat streaming support"
```

## Code Style

### TypeScript
- Use strict mode
- Define proper types
- Avoid `any` type

### React
- Use functional components
- Use hooks for state
- Validate props with TypeScript

### Naming
- camelCase for variables/functions
- PascalCase for components/classes
- UPPER_CASE for constants

### File Organization
```
feature/
├── Component.tsx      # React component
├── Component.test.tsx # Tests
├── types.ts          # Type definitions
├── hooks.ts          # Custom hooks
├── utils.ts          # Utility functions
└── api.ts            # API calls
```

## Pull Request Process

### 1. Update Your Branch
```bash
git fetch upstream
git rebase upstream/main
```

### 2. Push Changes
```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request
- Clear title and description
- Reference related issues (#123)
- Add screenshots if UI changes
- List breaking changes

### 4. PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe how to test changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Tests pass locally
```

## Areas for Contribution

### Bug Fixes
- Fix issues labeled `bug`
- Verify fix with tests
- Document the issue

### Features
- Check issues labeled `enhancement`
- Discuss major features first
- Follow project architecture

### Documentation
- Improve README
- Update API docs
- Add code comments
- Create tutorials

### Testing
- Add unit tests
- Add integration tests
- Improve test coverage

### Performance
- Optimize queries
- Improve load times
- Reduce bundle size

## Database Changes

### Creating Migrations
```bash
npx prisma migrate dev --name your_migration_name
```

### Updating Schema
1. Modify `prisma/schema.prisma`
2. Run migrations
3. Update types if needed

## API Changes

### Adding Endpoints
1. Add to `app/api/`
2. Add TypeScript types
3. Update documentation
4. Add error handling
5. Add authentication checks

### Deprecating APIs
1. Mark as deprecated in code
2. Update documentation
3. Provide migration path
4. Keep for 2 releases

## Component Development

### Creating Components
```tsx
// components/MyComponent.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>{title}</h1>
      {onAction && <Button onClick={onAction}>Action</Button>}
    </motion.div>
  );
}
```

### Component Testing
```tsx
// components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## AI/Chat Features

### Adding Prompts
1. Update `lib/ai.ts`
2. Add to `VETERINARY_SYSTEM_PROMPT`
3. Test with Claude API
4. Update documentation

### Testing Chat
```bash
# Test streaming
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}'
```

## Performance Considerations

- Use `React.memo` for expensive components
- Optimize images
- Lazy load routes
- Use TanStack Query for data
- Monitor bundle size

## Accessibility

- Add alt text to images
- Use semantic HTML
- Support keyboard navigation
- Test with screen readers
- Follow WCAG guidelines

## Reviews & Feedback

### Responding to Reviews
- Be open to feedback
- Explain your reasoning
- Request clarification if needed
- Make requested changes

### Reviewing Others' PRs
- Be constructive
- Acknowledge good work
- Suggest alternatives
- Approve when satisfied

## Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Improve docs
- `good first issue` - For newcomers
- `help wanted` - Need assistance
- `wontfix` - Not planned
- `duplicate` - Already reported

## Questions?

- GitHub Discussions
- GitHub Issues
- Email: dev@vetgo.app

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

Thank you for contributing to VetGo! 🐾
