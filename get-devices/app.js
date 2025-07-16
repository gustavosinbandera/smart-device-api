// get-devices/app.js

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Env vars
const DEVICES_TABLE = process.env.DEVICES_TABLE;
const DEVICE_ALIASES_TABLE = process.env.DEVICE_ALIASES_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

exports.lambdaHandler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders };
    }

    // Decode JWT
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Authorization token missing' }) };
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const decoded = jwt.decode(token);
    const user_id = decoded?.sub;
    const email = decoded?.email;

    if (!user_id || !email) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid token: missing user_id or email' }) };
    }

    // Ensure user exists
    const userCheck = await docClient.get({ TableName: USERS_TABLE, Key: { user_id } }).promise();
    if (!userCheck.Item) {
      await docClient.put({
        TableName: USERS_TABLE,
        Item: {
          user_id,
          email,
          registered_at: new Date().toISOString()
        }
      }).promise();
    }

    // Query Devices
    const devicesResult = await docClient.query({
      TableName: DEVICES_TABLE,
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: {
        ':uid': user_id
      }
    }).promise();

    const devices = devicesResult.Items;

    // For each device, get aliases
    const devicesWithAliases = await Promise.all(devices.map(async (device) => {
      const aliasResult = await docClient.query({
        TableName: DEVICE_ALIASES_TABLE,
        KeyConditionExpression: 'device_id = :did',
        ExpressionAttributeValues: {
          ':did': device.device_id
        }
      }).promise();

      const gpioAliases = aliasResult.Items.map(item => ({
        gpio: item.gpio,
        direction: item.direction,
        type: item.type,
        aliases: item.aliases || []
      }));

      return {
        ...device,
        aliases: gpioAliases
      };
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(devicesWithAliases)
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
