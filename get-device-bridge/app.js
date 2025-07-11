const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const ddb = new AWS.DynamoDB.DocumentClient();
const RASPBERRY_TABLE = process.env.RASPBERRY_TABLE;

exports.lambdaHandler = async (event) => {
  try {
    const token = event.headers?.Authorization || event.headers?.authorization;
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Token no proporcionado' }) };
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.sub) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Token inválido' }) };
    }

    const user_id = decoded.sub;

    const result = await ddb.query({
      TableName: RASPBERRY_TABLE,
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :uid',
      ExpressionAttributeValues: {
        ':uid': user_id
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor' })
    };
  }
};
