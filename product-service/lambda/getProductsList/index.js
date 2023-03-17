const { DynamoDB } = require('aws-sdk');

const db = new DynamoDB.DocumentClient();

// const TableNameProducts = process.env.TABLE_PRODUCTS;
// const TableNameStocks = process.env.TABLE_STOCKS;

module.exports.handler = async (event) => {
    console.log(event);

    const { Items: products = [] } = await db.scan({ TableName: 'products' }).promise();
    const { Items: stocks = [] } = await db.scan({ TableName: 'stocks' }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(products.map((item) => {
        const stock = stocks.find((stock) => stock.product_id === item.id);

        return { ...item, count: stock?.count || 0 };
      })),
    };
  };
  