// get-gps-history/app.js

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

exports.lambdaHandler = async (event) => {
  // Manejo de preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders
    };
  }

  const deviceId = event.queryStringParameters?.device_id;
  const start = event.queryStringParameters?.start;
  const end = event.queryStringParameters?.end;

  if (!deviceId || !start || !end) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Faltan parámetros: device_id, start, end' }),
    };
  }

  const params = {
    TableName: process.env.GPS_LOGS_TABLE,
    KeyConditionExpression: 'device_id = :d AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#ts': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':d': deviceId,
      ':start': start,
      ':end': end,
    },
    ScanIndexForward: true // orden cronológico
  };

  try {
    const data = await docClient.query(params).promise();
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.error('DynamoDB error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Error al consultar GpsLogs', error: err.message }),
    };
  }
};
