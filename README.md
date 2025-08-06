# united-api

A GraphQL server for client applications to access data from services.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The GraphQL server will be available at `http://localhost:4000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run commitlint` - Check the last commit message format
- `npm run release` - Generate changelog and create a new release
- `npm run release:patch` - Create a patch release (1.0.0 → 1.0.1)
- `npm run release:minor` - Create a minor release (1.0.0 → 1.1.0)
- `npm run release:major` - Create a major release (1.0.0 → 2.0.0)

### GraphQL Playground

Once the server is running, you can access the GraphQL Playground at:
`http://localhost:4000`

### Basic Query

Try this basic query in the playground:
```graphql
query {
  hello
}
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing.

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/production)
npm run test:run

# Run tests with UI interface
npm run test:ui
```

### Writing Tests

Tests are located in the `src/__tests__/` directory. Test files should follow the naming convention `*.test.ts`.

Example test:
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Releases and Changelog

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) to automatically generate changelogs and manage releases based on conventional commits.

### Creating a Release

```bash
# Automatically determine the next version based on commits
npm run release

# Force a specific release type
npm run release:patch  # 1.0.0 → 1.0.1
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
```

### What happens during a release:

1. Analyzes commits since the last release
2. Determines the next version number
3. Updates `package.json` version
4. Generates/updates `CHANGELOG.md`
5. Creates a git tag
6. Commits the changes

### Changelog

The changelog is automatically generated from conventional commit messages. See [CHANGELOG.md](./CHANGELOG.md) for the full project history.

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to ensure consistent commit message formatting. Commit messages are automatically validated using commitlint.

### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or external dependencies
- `revert`: Reverts a previous commit

### Examples

```bash
feat: add user authentication
fix: resolve GraphQL query timeout issue
docs: update API documentation
chore: update dependencies
```
