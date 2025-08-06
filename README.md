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
