const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
    console.log(event);

    const { pathParameters: { id } = {} } = event;

    const { Items: products = [] } = await db.scan({ TableName: 'products' }).promise();
    const { Items: stocks = [] } = await db.scan({ TableName: 'stocks' }).promise();

    const product = products.find((item) => item.id === id);
    const stock = stocks.find((item) => item.product_id === id);

    if (!product) {
        return {
            statusCode: 400,
            body: 'Product not found',
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ...product, count: stock?.count || 0 }),
    };
  };
  