import gql from "graphql-tag";

export const ENS_SUGGESTIONS = gql`
  query lookup($name: String!, $amount: Int!) {
    domains(
      first: $amount
      where: { name_starts_with: $name, resolvedAddress_not: null }
      orderBy: labelName
      orderDirection: asc
    ) {
      name
      resolver {
        texts
        addr {
          id
        }
      }
      owner {
        id
      }
    }
  }
`;

export const ENS_SEARCH = gql`
  query lookup($name: String!, $amount: Int!) {
    domains(first: $amount, where: { name: $name }) {
      name
      resolver {
        addr {
          id
        }
      }
    }
  }
`;

export const ENS_DOMAINS = gql`
  query lookup($name: String!) {
    domains(where: { name: $name }) {
      name
      labelhash
      resolver {
        addr {
          id
        }
      }
    }
  }
`;