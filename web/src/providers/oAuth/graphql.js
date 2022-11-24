export const OAUTH_URL_MUTATION = gql`
  mutation oAuthUrlQuery($type: String!) {
    oAuthUrl(type: $type) {
      url
      type
      text
    }
  }
`

export const OAUTH_CODE_GRANT_MUTATION = gql`
  mutation codeGrant(
    $type: String!
    $code: String!
    $state: String
    $accountId: String
  ) {
    codeGrant(type: $type, state: $state, code: $code, accountId: $accountId) {
      action
      text
      status
      ramp {
        id
        address
        accountNickname
        isoCurrencyCode
        type
      }
    }
  }
`

export const OAUTH_REVOKE_MUTATION = gql`
  mutation revokeOAuth($type: String!) {
    revokeOAuth(type: $type) {
      status
    }
  }
`
