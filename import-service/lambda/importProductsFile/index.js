const { S3 } = require('aws-sdk');

const s3 = new S3({ signatureVersion: 'v4' });

const BUCKET_NAME = "katrading-import";
const CATALOG_NAME = "uploaded";

module.exports.handler = async (event) => {
    console.log(event);

    const { pathParameters: { name } = {} } = event;

    const params = {
        Bucket: BUCKET_NAME,
        Key: `${CATALOG_NAME}/${name}`,
        ContentType: "text/csv",
    };

    // const s3ListObjects = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: CATALOG_NAME, MaxKeys: 1 });

    // if (s3ListObjects.Contents.length === 0) {
    //     await s3.create
    // }

    const s3PutObjectUrl = await s3.getSignedUrlPromise("putObject", params);

    return {
        statusCode: 200,
        body: typeof s3PutObjectUrl === 'string' ? s3PutObjectUrl : JSON.stringify(s3PutObjectUrl),
    };
};
