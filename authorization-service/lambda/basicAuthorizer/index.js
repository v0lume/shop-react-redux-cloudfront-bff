module.exports.handler = async (event, ctx, cb) => {
    console.log(JSON.stringify(event));

    try {
        const authHeader = event.identitySource[0];
        const authToken = authHeader.split(' ')[1];

        const [ username, password ] = Buffer
            .from(authToken, 'base64')
            .toString('utf-8')
            .split(':');

        const storedUserPassword = process.env[username];
        const isCredentialsValid = !!storedUserPassword && storedUserPassword === password;


        const effect = isCredentialsValid ? 'Allow' : 'Deny';
        const policy = generatePolicy(authToken, event.routeArn, effect);

        console.log('policy', JSON.stringify(policy));

        return cb(null, policy);
    } catch (error) {
        console.log('error', error);

        let message = 'Unknown error';

        if (error instanceof Error) {
            message = error.message;
        }

        return cb(`Error: ${message}`);
    }
};

const generatePolicy = (principalId, resource, effect = 'Deny') => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
}
