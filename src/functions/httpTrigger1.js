    const { Pool } = require('pg');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcrypt');

    // PostgreSQL connection pool
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    const app = require('@azure/functions').app;

    app.http('auth', {
        methods: ['GET', 'POST'],
        authLevel: 'anonymous',
        handler: async (request, context) => {
            context.log(`Http function processed request for url "${request.url}"`);

            // Handle different request methods
            // if (request.method === 'POST') {
            //     // Handle user login
            //     return await userLogin(request, context);
            // } else {
                // Handle other methods or provide a default response
                const name = request.query.get('name') || await request.text() || 'world';
                return { status: 200, body: `Hello, ${name}!` };
            // }
        }
    });

    async function userLogin(request, context) {
        try {
            // Ensure the request body is parsed correctly
            const body = await request.json();
            const { email, password } = body;
    console.log(body, "kumarrr")
            if (!email || !password) {
                context.log('Email and password are required');
                return { status: 400, body: 'Email and password are required' };
            }
            const FETCH_LOGIN_CREDENTIALS = 'SELECT * FROM public.prwebuser WHERE email = $1;';

  
            // Fetch user from the database
            const result = await pool.query(FETCH_LOGIN_CREDENTIALS, [email]);

            if (result.rows.length === 0) {
                context.log('User not found');
                return { status: 401, body: 'Invalid email or password' };
            }

            const user = result.rows[0];

            // Compare the provided password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);
            // const isMatch = password===user.password

            if (!isMatch) {
                context.log('Invalid password');
                return { status: 401, body: 'Invalid email or password' };
            }

            // Generate a JWT token
            const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            context.log('Login successful');
            return { status: 200, body: JSON.stringify({ message: 'Login successful', token }) };
        } catch (error) {
            context.log(`Error logging in: ${error.message}`);
            return { status: 500, body: 'Internal server error' };
        }
    }

    // app.http('userRegistration', {
    //     methods: ['GET', 'POST'],
    //     authLevel: 'anonymous',
    //     handler: async (request, context) => {
    //         context.log(`Http function processed request for url "${request.url}"`);

    //         // Handle different request methods
    //         if (request.method === 'POST') {
    //             // Handle user login
    //             return await userRegistration(request, context);
    //         } else {
    //             // Handle other methods or provide a default response
    //             const name = request.query.get('name') || await request.text() || 'world';
    //             return { status: 200, body: `Hello, ${name}!` };
    //         }
    //     }
    // });

    // const userRegistration = async function (req, res) {
    //     const { email, password, first_name,last_name } = req.body;
      
    //     try {
    //       if (!email || !password) {
    //         return res.status(400).json({ message: "Invalid input" });
    //       }
      
    //       const hash = await bcrypt.hash(password, 10);
    //       const CREATE_NEW_USER = ' INSERT INTO public.prwebuser (email, password, first_nm,last_nm) VALUES ($1, $2, $3, $4) RETURNING *';
    //       const createdUser = await pool.query(CREATE_NEW_USER, [
    //         email,
    //         hash,
    //         first_name,
    //         last_name
    //       ]);
      
    //       logger.info("New User Created", { id: createdUser.rows[0], email });
      
    //       res.status(201).json({
    //         message: "User Created Successfully",
    //         userDetails: {
    //           id: createdUser.rows[0],
    //           email: createdUser.rows[0].email,
    //           firstname: createdUser.rows[0].first_nm,
    //         },
    //       });
    //     } catch (error) {
    //       logger.error("Error creating user", error);
    //       res.status(500).json({ message: "Internal Server Error" });
    //     }
    //   };
