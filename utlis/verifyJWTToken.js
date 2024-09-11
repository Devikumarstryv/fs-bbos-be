const jwt = require('jsonwebtoken');

const verifyJWTToken = (req, res, next) => {
    // console.log(req.headers);

    // Extract token from the Authorization header
    const authHeader = req.headers['access_token'];
    let token;

    if (authHeader) {
        // If Bearer is present, split the token out
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            // Use the entire authHeader as the token if Bearer is not present
            token = authHeader;
        }
    }

    // Fallback to token from cookie if not found in Authorization header
    if (!token && req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token is found in either the header or the cookie, return an error
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided. Please Login' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token. Please Login Again' });
        }


        // Attach the user information to the request object
        req.user = user;
        console.log("Decoded value :",user)

        next();
    });
    
};

module.exports = {verifyJWTToken};
