const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS"
};

exports.lambdaHandler = async (event) => {
  try {
    // Obtener token del header Authorization
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Token de autorización no encontrado' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.decode(token);
    const user_id = decoded?.sub;
    const email = decoded?.email;

    if (!user_id || !email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Token inválido: falta user_id o email' })
      };
    }

    // Verificar si el usuario existe en la tabla Users
    const userCheckParams = {
      TableName: 'Users',
      Key: { user_id }
    };

    const userCheck = await docClient.get(userCheckParams).promise();

    if (!userCheck.Item) {
      const newUser = {
        user_id,
        email,
        registered_at: new Date().toISOString()
      };

      const putUserParams = {
        TableName: 'Users',
        Item: newUser
      };

      await docClient.put(putUserParams).promise();
      console.log('🟢 Usuario registrado:', newUser);
    }

    // Consultar dispositivos por user_id
    const deviceParams = {
      TableName: 'Devices',
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: {
        ':uid': user_id
      }
    };

    console.log('🔎 Buscando dispositivos para:', user_id);
    const deviceData = await docClient.query(deviceParams).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(deviceData.Items)
    };

  } catch (err) {
    console.error('🔥 ERROR en Lambda:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Error interno del servidor', detail: err.message })
    };
  }
};
