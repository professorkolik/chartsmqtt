import Chart from './modules/chart';
import AWS from 'aws-sdk';
// Import gql helper and craft a GraphQL query
import gql from 'graphql-tag';

// Require AppSync module
import {AUTH_TYPE} from 'aws-appsync/lib/link/auth-link';
import AWSAppSyncClient from 'aws-appsync';

// Require exports file with endpoint and auth info
import aws_exports from './aws-exports';

require('es6-promise').polyfill();
import 'isomorphic-fetch';

const url = aws_exports.ENDPOINT;
const region = aws_exports.REGION;
const type = AUTH_TYPE.API_KEY;

// If you want to use API key-based auth
const apiKey = 'da2-hyeonlq65feh7c32wct434uqfi';

AWS.config.update({
  region: aws_exports.REGION
});

const listItemsQuery = gql(`
query listItems {
  listItems {
    items {
      title
      value1
      value2
      timestamp
    }
  }
}`);

// Set up a subscription query
const onCreateItemsQuery = gql(`
subscription onCreateItems {
onCreateItems {
    __typename
    title
    value1
    value2
    timestamp
}
}`);

// Set up Apollo client
const client = new AWSAppSyncClient({
  url: url,
  region: region,
  auth: {
    type: type,
    apiKey: apiKey
  },
  disableOffline: true
});

const chart = new Chart();

client.hydrated().then(function (client) {
  //Now run a query
  client.query({query: listItemsQuery})
    .then(function logData(data) {
      console.log('results of query: ', data);
      chart.updateChart(data.data.listItems.items);
    })
    .catch(console.error);

  //Now subscribe to results
  const observable = client.subscribe({query: onCreateItemsQuery});

  const realtimeResults = function realtimeResults(data) {
    console.log('realtime data: ', data);
    chart.updateChart([data.data.onCreateItems]);
  };

  observable.subscribe({
    next: realtimeResults,
    complete: console.log,
    error: console.log,
  });
});
