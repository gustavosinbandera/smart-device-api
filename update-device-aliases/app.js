// update-device-aliases/app.js
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'PUT,OPTIONS'
};

export const lambdaHandler = async (event) => {
  /* 1) Pre-flight OPTIONS ─ responde 200 vacío */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  /* 2) Parseo seguro del cuerpo */
  let aliases = [];
  try {
    const body = JSON.parse(event.body || '{}');
    aliases = Array.isArray(body.aliases) ? body.aliases : [];
  } catch {
    /* deja aliases = [] */
  }

  if (!aliases.length) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ message: 'aliases array vacío o faltante' })
    };
  }

  /* ---------- LOGS PARA DEPURAR ---------- */
  console.log('env.DEVICE_ALIASES_TABLE =', process.env.DEVICE_ALIASES_TABLE);
  console.log('pathParameters =', event.pathParameters);
  console.log('aliases recibidos =', aliases);
  /* --------------------------------------- */

  const { device_id, gpio } = event.pathParameters;
  const skNumber = gpio.replace(/^gpio-?/i, ''); 

  const params = {
    TableName: process.env.DEVICE_ALIASES_TABLE,
    Key: {
      device_id: { S: device_id },
      sk: { S: `GPIO#${skNumber}` }
    },
    UpdateExpression: 'SET aliases = :a',
    ExpressionAttributeValues: {
      ':a': { L: aliases.map((a) => ({ S: a.trim() })) }
    },
    ReturnValues: 'ALL_NEW'            // ← devuelve el ítem final
  };

  console.log('UpdateItem params =', JSON.stringify(params, null, 2)); // ← LOG 4

  const result = await client.send(new UpdateItemCommand(params));
  console.log('UpdateItem result =', JSON.stringify(result.Attributes, null, 2));

  return {
    statusCode: 200,
    headers: cors,
    body: JSON.stringify({ message: 'Aliases actualizados', aliases })
  };
};
