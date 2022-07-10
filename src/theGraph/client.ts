import {
    ApolloClient,
    ApolloQueryResult,
    HttpLink,
    InMemoryCache,
    QueryOptions,
  } from '@apollo/client'

// this code is adapted from rainbow wallet at: https://github.com/rainbow-me/rainbow/blob/develop/src/apollo/client.ts

const defaultOptions = {
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      errorPolicy: 'ignore',
      fetchPolicy: 'no-cache',
    },
};
  
export const compoundClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2',
    }),
});
  
  export const uniswapClient = new ApolloClient({
    ...defaultOptions,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2',
    }),
  });
  
export const blockClient = new ApolloClient({
    ...defaultOptions,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    }),
});
  
export const ensClient = new ApolloClient({
    ...defaultOptions,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    }),
});