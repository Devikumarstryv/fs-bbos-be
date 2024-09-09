const { app } = require('@azure/functions');
const {userLogin} = require('../../cotrollers/loginController')

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        const name = request.query.get('name') || await request.text() || 'world';
        return { body: `Hello, ${name}!` };
    }
});

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: userLogin
});

