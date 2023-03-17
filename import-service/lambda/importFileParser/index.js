const { S3 } = require('aws-sdk');
const csv = require('csv-parser');

const s3 = new S3({ signatureVersion: 'v4' });

const BUCKET_NAME = "katrading-import";
const CATALOG_NAME = "uploaded";
const CATALOG_PARSED_NAME = "parsed";

module.exports.handler = async (event) => {
    console.log(event);

    const params = {
        Bucket: BUCKET_NAME,
        Key: event.Records[0].s3.object.key,
    };

    try {
        const s3ReadStream = s3.getObject(params).createReadStream();
    
        s3ReadStream
          .pipe(csv())
          .on("data", console.log)
          .on("end", async () => {
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
          });    
    } catch (err) {
        return { statusCode: 500, body: typeof err.message === 'string' ? err.message : JSON.stringify(err.message) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
