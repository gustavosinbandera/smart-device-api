// get-devices/app.js
// Lambda function to get devices for an authenticated user

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Initialize DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Table names from environment variables
const DEVICES_TABLE = process.env.DEVICES_TABLE;
//const DEVICE_ALIASES_TABLE = process.env.DEVICE_ALIASES_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

// exports.handler = async () => {
//   const AWS = require("aws-sdk");
//   const ddb = new AWS.DynamoDB.DocumentClient();
//   const data = await ddb.scan({ TableName: process.env.DEVICES_TABLE }).promise();
//   console.log("Scan result:", JSON.stringify(data.Items));
//   return {
//     statusCode: 200,
//     headers: corsHeaders,
//     body: JSON.stringify(data.Items)
//   };
// };

exports.lambdaHandler = async (event) => {
  try {
    // Handle preflight CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders
      };
    }

    // Extract and decode JWT token
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Authorization token missing' })
      };
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const decoded = jwt.decode(token);
    const user_id = decoded?.sub;
    const email = decoded?.email;

    if (!user_id || !email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid token: missing user_id or email' })
      };
    }

    // Ensure user exists in USERS_TABLE
    const userParams = {
      TableName: USERS_TABLE,
      Key: { user_id }
    };
    const userResult = await docClient.get(userParams).promise();

    if (!userResult.Item) {
      const newUser = {
        user_id,
        email,
        registered_at: new Date().toISOString()
      };
      await docClient.put({ TableName: USERS_TABLE, Item: newUser }).promise();
      console.log('New user registered', newUser);
    }

    // Query devices by user_id
    const devicesParams = {
      TableName: DEVICES_TABLE,
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: {
        ':uid': user_id
      }
    };

    const devicesResult = await docClient.query(devicesParams).promise();

    console.log("**********************************");
    console.log("**********************************");
    console.log(`table name: ${process.env.DEVICES_TABLE}`);
    const AWS = require("aws-sdk");
    const ddb = new AWS.DynamoDB.DocumentClient();
    const data = await ddb.scan({ TableName: process.env.DEVICES_TABLE }).promise();
    console.log("Scan result:", JSON.stringify(data.Items));




    const devices = devicesResult.Items;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(devices)
    };
  } catch (error) {
    console.error('Error in GetDevicesFunction:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', detail: error.message })
    };
  }
};
