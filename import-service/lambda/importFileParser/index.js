const { S3, SQS, util } = require('aws-sdk');
const csv = require('csv-parser');

const s3 = new S3({ signatureVersion: 'v4' });
const sqs = new SQS();

// TODO: move this to env
const BUCKET_NAME = "katrading-import";
const CATALOG_NAME = "uploaded";
const CATALOG_PARSED_NAME = "parsed";
const SQS_URL = "https://sqs.us-east-1.amazonaws.com/497048328653/catalogItemsQueue";

module.exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    const params = {
        Bucket: BUCKET_NAME,
        Key: event.Records[0].s3.object.key,
    };

    try {
        const s3ReadStream = s3.getObject(params).createReadStream();
        await new Promise((resolve, reject) => {
            s3ReadStream
                .pipe(csv())
                .on('data', (product) => {
                    const params = {
                        QueueUrl: SQS_URL,
                        MessageBody: JSON.stringify(product),
                    };

                    sqs.sendMessage(params, (error, data) => {
                        if (error) {
                            console.log('error', JSON.stringify(error));
                            return { statusCode: 500, body: typeof err.message === 'string' ? err.message : JSON.stringify(err.message) };
                        } else {
                            console.log('success', JSON.stringify(data));
                        }
                    });
                })
                .on('error', error => {
                    console.log('failed to parse csv', error);
                    reject(error.message);
                })
                .on('end', async () => {
                    await s3
                        .copyObject({
                            Bucket: BUCKET_NAME,
                            CopySource: BUCKET_NAME + "/" + event.Records[0].s3.object.key,
                            Key: event.Records[0].s3.object.key.replace(`${CATALOG_NAME}/`, `${CATALOG_PARSED_NAME}/`),
                        })
                        .promise();
            
                    await s3
                        .deleteObject({
                            Bucket: BUCKET_NAME,
                            Key: event.Records[0].s3.object.key,
                        })
                        .promise();

                    resolve();
                });
        });
    } catch (err) {
        console.log('error', err);
        return { statusCode: 500, body: typeof err.message === 'string' ? err.message : JSON.stringify(err.message) };
    }

    return { statusCode: 200, Body: JSON.stringify({ success: true }) };
};
