const products = require('../../data/products.json');

module.exports.handler = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(products.map((item) => ({
        id: item.id,
        title: `${item.manufacturer} ${item.model} ${item.package}`,
        description: `${item.fuel}, ${item.transmission} transmision, ${item.power}hp`,
        price: `${item.price} ${item.currency}`,
      }))),
    };
  };
  