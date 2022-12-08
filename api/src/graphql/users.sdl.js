export const schema = gql`
  type User {
    id: String!
    username: String
    createdAt: DateTime!
    locale: String
    address: String
    accessToken: String
    refreshToken: String
  }
  type Query {
    user(id: String!): User @skipAuth
    users: User @skipAuth
  }
`
