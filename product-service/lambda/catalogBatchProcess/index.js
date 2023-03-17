const { DynamoDB, SNS } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const db = new DynamoDB.DocumentClient();
const sns = new SNS();

module.exports.handler = async (event) => {
    console.log(event);

    const products = event.Records.map(x => JSON.parse(x.body));

    for(const product of products) {
        const id = uuidv4();

        const newProductParams = {
            TableName: 'products',
            Item: {
                id,
                price: '' + product.price,
                title: product.title,
                description: product.description,
            },
        };

        await db.put(newProductParams).promise();

        const newCountParams = {
            TableName: 'stocks',
            Item: {
                product_id: id,
                count: product.count
            },
        };

        await db.put(newCountParams).promise();
    }

    try{
        await sns.publish({
            Subject: 'KaTrading Products Created',
            Message: JSON.stringify(products),
            TopicArn: process.env.SNS_ARN
        }).promise();
    } catch(error) {
        console.log('error', error);
    }
};
