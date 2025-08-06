import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Address {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: Role!
    phoneNumber: String
    address: Address
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type AdminStats {
    totalUsers: Int!
    totalAdmins: Int!
    regularUsers: Int!
  }

  type AdminStatsResponse {
    stats: AdminStats!
    recentUsers: [User!]!
  }

  type HealthStatus {
    status: String!
    timestamp: String!
    service: String!
  }

  enum Role {
    USER
    ADMIN
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    address: AddressInput
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    address: AddressInput
  }

  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    phoneNumber: String
    address: AddressInput
  }

  type Query {
    # Health check
    health: HealthStatus!
    
    # User queries (require authentication)
    me: User
    users: [User!]!
    user(id: ID!): User
    
    # Admin queries (require admin role)
    adminStats: AdminStatsResponse!
  }

  type Mutation {
    # Authentication mutations (public)
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    
    # User mutations (require authentication)
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): User!
    
    # Admin mutations (require admin role)
    promoteUser(id: ID!): User!
    demoteUser(id: ID!): User!
  }
`;
