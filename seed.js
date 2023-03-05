const AWS = require('aws-sdk');

const products = require('./data/products.json');
const stocks = require('./data/stocks.json');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'epam-h4v3u' });
AWS.config.update({ region: 'us-east-1' });
const db = new AWS.DynamoDB.DocumentClient();

Promise.all([
    products.forEach((item) => {
        return db.put({
            TableName: 'products',
            Item: {
                id: item.id,
                title: `${item.manufacturer} ${item.model} ${item.package}`,
                description: `${item.fuel}, ${item.transmission} transmision, ${item.power}hp`,
                price: item.price,
            },
        }).promise();
    }),
    stocks.forEach((item) => {
        return db.put({
            TableName: 'stocks',
            Item: item,
        }).promise();
    }),
]).then(() => console.log('ok'));
