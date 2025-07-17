// get-device-by-id/app.js
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const ddb = new AWS.DynamoDB.DocumentClient();
const DEVICES_TABLE = process.env.DEVICES_TABLE;
const ALIASES_TABLE = process.env.DEVICE_ALIASES_TABLE;

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

    const token = event.headers?.Authorization || event.headers?.authorization;
    if (!token) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Token no proporcionado' })
      };
    }

    const decoded = jwt.decode(token.replace(/^Bearer\s+/i, ''));
    const user_id = decoded?.sub;

    if (!user_id) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Token inválido' })
      };
    }

    const deviceId = event.pathParameters.device_id;
    console.log('deviceId actual:', deviceId);

    // Verificar propiedad del dispositivo
    const device = await ddb.get({
      TableName: DEVICES_TABLE,
      Key: { device_id: deviceId }
    }).promise();

    if (!device.Item || device.Item.user_id !== user_id) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Dispositivo no encontrado o acceso denegado' })
      };
    }

    // Obtener aliases del dispositivo
    const aliasResult = await ddb.query({
      TableName: ALIASES_TABLE,
      KeyConditionExpression: 'device_id = :id',
      ExpressionAttributeValues: {
        ':id': deviceId
      }
    }).promise();

    // Validar que cada ítem tenga 'sk'
    const validItems = aliasResult.Items.filter(item => item && typeof item.sk === 'string');

    const metadata = validItems.find(item => item.sk === '#METADATA#') || {};
    const gpioAliases = validItems
      .filter(item => item.sk.startsWith('GPIO#'))
      .map(item => ({
        ...item
      }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify([{ ...metadata }, ...gpioAliases])
    };

  } catch (err) {
    console.error('Error en get-device-by-id:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Error interno del servidor' })
    };
  }
};
