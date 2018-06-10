import Chart from './modules/chart';
require('es6-promise').polyfill();
require('isomorphic-fetch');

// Require exports file with endpoint and auth info
const aws_exports = require('./aws-exports').default;

// Require AppSync module
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

const url = aws_exports.ENDPOINT;
const region = aws_exports.REGION;
const type = AUTH_TYPE.API_KEY;

// If you want to use API key-based auth
const apiKey = 'da2-vrivdjhd4vd2tng7euea3ji5eq';
// If you want to use a jwtToken from Amazon Cognito identity:
const jwtToken = 'xxxxxxxx';

// If you want to use AWS...
const AWS = require('aws-sdk');
AWS.config.update({
  region: aws_exports.REGION,
  // credentials: new AWS.Credentials({
  //     accessKeyId: aws_exports.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: aws_exports.AWS_SECRET_ACCESS_KEY
  // })
});
// const credentials = AWS.config.credentials;

// Import gql helper and craft a GraphQL query
const gql = require('graphql-tag');
const query = gql(`
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
const subquery = gql(`
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
    apiKey: apiKey,
    // credentials: credentials,
  },
  disableOffline: true
});

const chart = new Chart();

client.hydrated().then(function (client) {
  //Now run a query
  client.query({query: query})
    .then(function logData(data) {
      console.log('results of query: ', data);
      chart.updateChart(data.data.listItems.items);
    })
    .catch(console.error);

  //Now subscribe to results
  const observable = client.subscribe({query: subquery});

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