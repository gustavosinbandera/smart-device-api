const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.lambdaHandler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const deviceId = body.device_id || 'esp32-armenia';
  const route = [
    [4.534410, -75.675610], // Parque Sucre
    [4.534820, -75.676300], // Calle 21
    [4.535230, -75.677100], // Carrera 15
    [4.535730, -75.678050], // Calle 26
    [4.536290, -75.678930], // Carrera 19
    [4.537100, -75.680100], // Parque de la Vida
  ];

  const items = [];

  const now = Date.now();
  for (let i = 0; i < route.length; i++) {
    const [lat, lon] = route[i];
    const timestamp = new Date(now + i * 1000).toISOString();

    items.push({
      PutRequest: {
        Item: {
          device_id: deviceId,
          timestamp,
          lat,
          lon,
          speed: 15 + Math.random() * 5
        }
      }
    });
  }

  try {
    await docClient.batchWrite({
      RequestItems: {
        [process.env.GPS_LOGS_TABLE]: items
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Simulados ${items.length} puntos en Armenia, Quindío`, deviceId }),
    };
  } catch (err) {
    console.error('Error al simular GPS:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
