const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const db = new DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
    console.log(event);

    const { body } = event;

    let data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      return {
        statusCode: 400,
        body: 'Invalid input',
      };
    }

    // simple input validation
    const availableKeys = ['title', 'description', 'price', 'count'];

    availableKeys.forEach((key) => {
        if (!Object.keys(data).includes(key)) {
            return {
                statusCode: 400,
                body: JSON.stringify(`Missing "${key}" field`),
            };
        }
    });

    // prepare data
    const productId = uuidv4();

    const product = {
        id: productId,
        title: data.title,
        description: data.description,
        price: data.price,
    };

    const stock = {
        product_id: productId,
        count: data.count,
    }

    // transaction insert
    await db.transactWrite({
        TransactItems: [
            {
                Put: {
                    TableName: 'products',
                    Item: product,
                },
            },
            {
                Put: {
                    TableName: 'stocks',
                    Item: stock,
                },
            }
        ],
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ ...product, count: stock.count }),
    };
  };
  