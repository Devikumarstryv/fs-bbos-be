const { app } = require('@azure/functions');
const db = require('./db'); // Assuming you have a db.js file that handles database operations

app.http('getUsers', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed a GET request for url "${request.url}"`);

            try {
                const data = await db.getData(); // Assuming you have a getData function in your db.js file
                console.log("data",data)
                return { body: JSON.stringify(data) };
            } catch (error) {
                context.log(`Error fetching data: ${error}`);
                return { status: 500, body: 'Error fetching data' };
            }
        
    }
});