const products = require('../../data/products.json');

module.exports.handler = async (event) => {
    const { pathParameters: { id } = {} } = event;

    const product = products.find((item) => item.id === id);

    if (!product) {
        return {
            statusCode: 400,
            body: 'Product not found',
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  };
  