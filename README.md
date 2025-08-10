# united-api

A GraphQL server for client applications to access data from services. This server integrates with the [users-service](https://github.com/wingedearth/users-service) REST API to provide GraphQL access to user management functionality.

## Getting Started

### Prerequisites
- Node.js (v22.16.0 or higher)
- npm (v10.0.0 or higher)

### Installation

1. Clone the repository
2. Use the correct Node.js version (if using nvm):
   ```bash
   nvm use
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The GraphQL server will be available at `http://localhost:4000/graphql`

> 💡 **Apollo Studio Sandbox**: Visit `http://localhost:4000/graphql` in your browser for the interactive GraphQL playground.

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

## Technical Stack

### Core Technologies
- **Apollo Server 4**: Standalone GraphQL server with built-in Apollo Studio sandbox
- **TypeScript**: Full type safety and modern JavaScript features
- **GraphQL**: Schema-first API design with introspection support
- **Node.js**: Runtime environment (v22.16.0+)

### Key Dependencies
- `@apollo/server`: GraphQL server implementation
- `graphql`: GraphQL query language and runtime
- `axios`: HTTP client for REST API integration
- `jsonwebtoken`: JWT token handling for authentication
- `dotenv`: Environment variable management

### Development & Testing
- **Vitest**: Fast unit testing framework with coverage
- **Husky**: Git hooks for code quality
- **Commitlint**: Conventional commit message validation
- **Standard Version**: Automated changelog and versioning

### Deployment
- **Heroku**: Cloud platform with automatic deployment
- **GitHub Integration**: Continuous deployment from master branch
- **TypeScript Build**: Automatic compilation on deployment

### Apollo Studio Sandbox

Once the server is running, you can access the interactive Apollo Studio sandbox at:
`http://localhost:4000/graphql`

The sandbox provides:
- Interactive query editor with syntax highlighting
- Schema exploration and documentation
- Query history and saved operations
- Real-time query execution and results

### GraphQL API

The server provides a comprehensive GraphQL API that integrates with the users-service. Here are some example queries:

#### Health Check (Public)
```graphql
query {
  health {
    status
    timestamp
    service
  }
}
```

#### Authentication (Public)
```graphql
# Register a new user
mutation {
  register(input: {
    email: "user@example.com"
    password: "securePassword123"
    firstName: "John"
    lastName: "Doe"
  }) {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}

# Login
mutation {
  login(input: {
    email: "user@example.com"
    password: "securePassword123"
  }) {
    token
    user {
      id
      email
      role
    }
  }
}
```

#### User Queries (Require Authentication)
```graphql
# Get current user
query {
  me {
    id
    email
    firstName
    lastName
    role
  }
}

# Get all users
query {
  users {
    id
    email
    firstName
    lastName
    role
  }
}
```

**Note**: For authenticated queries, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

See [examples/queries.graphql](./examples/queries.graphql) for more comprehensive examples.

## Users Service Integration

This GraphQL server acts as a gateway to the [users-service](https://github.com/wingedearth/users-service) REST API. 

### Configuration

Set the users-service URL in your `.env` file:
```bash
USERS_SERVICE_URL=http://localhost:3000
```

### Features

- **Authentication**: Register and login users via GraphQL mutations
- **User Management**: CRUD operations for users with proper authorization
- **Role-Based Access**: Admin-only operations for user promotion/demotion
- **Real-time Data**: Direct integration with users-service ensures data consistency
- **Error Handling**: Comprehensive error handling with meaningful GraphQL error codes

### Authentication Flow

1. **Register/Login**: Use public mutations to get a JWT token
2. **Include Token**: Add `Authorization: Bearer <token>` header to requests
3. **Access Protected Data**: Query user data and perform operations based on your role

### Prerequisites

Make sure the users-service is running before starting this GraphQL server:

```bash
# In your users-service directory
npm run dev
```

The users-service should be available at `http://localhost:3000` (or your configured URL).

## Testing

This project uses [Vitest](https://vitest.dev/) for comprehensive testing with full TypeScript support. Tests are located in the `src/__tests__` directory.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

- **Unit Tests**: 
  - `basic.test.ts` - Basic functionality tests
  - `context.test.ts` - JWT context and authentication tests
  - `usersService.test.ts` - Users service client tests
  - `resolvers.test.ts` - GraphQL resolver tests
  - `integration.test.ts` - Full GraphQL schema integration tests

- **Test Coverage**: Comprehensive coverage including:
  - Authentication and authorization flows
  - GraphQL schema validation
  - Error handling scenarios
  - JWT token processing
  - Users service integration
  - Admin role verification

### Test Features

- **Mocking**: Uses Vitest's built-in mocking for:
  - External HTTP requests (axios)
  - JWT token decoding
  - Users service methods
- **Type Safety**: Full TypeScript support in tests
- **Coverage Reports**: HTML and JSON coverage reports
- **Integration Testing**: Tests actual GraphQL operations

### Coverage Report

The test suite provides excellent coverage of core functionality:
- Context and authentication: 100% coverage
- GraphQL schema: 100% coverage  
- Resolvers and services: 50%+ coverage
- Overall project coverage: ~57%

### Pre-commit Testing

Tests are automatically run before each commit via Husky hooks to ensure code quality and prevent regressions.

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

## Deployment

This application is configured for easy deployment to Heroku.

### Heroku Deployment

This application is configured for **automatic deployment** from GitHub to Heroku. Any changes pushed to the `main` branch will automatically trigger a new deployment.

#### Automatic Deployment Setup

The app is already configured with:
- **GitHub Integration**: Automatic deployments from the `main` branch
- **Environment Variables**: Pre-configured with the correct users-service URL
- **Build Process**: Automatic TypeScript compilation via `heroku-postbuild`

#### Manual Deployment (if needed)

If you need to deploy manually:

1. **Set environment variables** (if not already set):
   ```bash
   heroku config:set USERS_SERVICE_URL=https://wingedearth-users-service-174104f65795.herokuapp.com
   heroku config:set NODE_ENV=production
   ```

2. **Deploy via Git** (if GitHub integration is disabled):
   ```bash
   # Add Heroku remote if not already added
   heroku git:remote -a wingedearth-united-api
   
   # Deploy to Heroku
   git push heroku main
   ```

#### Environment Variables

Set these environment variables in your Heroku app:

- `USERS_SERVICE_URL`: URL of your deployed users-service
- `NODE_ENV`: Set to `production`
- `PORT`: Automatically set by Heroku

#### Deployment Configuration

The app includes:
- `Procfile`: Defines the web process
- `app.json`: Heroku app configuration
- `.slugignore`: Excludes unnecessary files from deployment
- `heroku-postbuild`: Automatically builds TypeScript on deployment

#### One-Click Deploy

You can also deploy directly from GitHub using the Deploy to Heroku button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/wingedearth/united-api)

### Automatic Deployment Benefits

- **Continuous Integration**: Every push to `master` triggers automatic deployment
- **Zero Downtime**: Heroku handles rolling deployments
- **Build Validation**: Failed builds prevent deployment
- **Rollback Support**: Easy rollback to previous versions if needed

### Production Features

- **Apollo Studio Sandbox**: Interactive GraphQL playground available in production
- **Environment Variables**: All required variables are pre-configured
- **Users Service Integration**: Connected to deployed users-service API
- **Introspection Enabled**: Full GraphQL schema introspection for development
- **CSRF Protection Disabled**: Easier access for development and testing
- **Standalone Server**: Clean, lightweight Apollo Server setup
- **TypeScript Build**: Automatic TypeScript compilation on deployment

### Verifying Deployment

After deployment, test your GraphQL endpoint:

```bash
curl -X POST https://wingedearth-united-api-76c9d860a852.herokuapp.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health { status timestamp service } }"}'
```

**Live Apollo Studio Sandbox**: https://wingedearth-united-api-76c9d860a852.herokuapp.com/graphql

> 💡 **Tip**: Visit the GraphQL endpoint URL in your browser to access the interactive Apollo Studio sandbox for testing queries and exploring the schema.
