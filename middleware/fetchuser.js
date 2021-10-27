const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const jwtSignature = process.env.JWT_SIGNATURE

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Please login or use valid credentials" })
    }
    try {
        const data = jwt.verify(token, jwtSignature)
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please login or use valid credentials" })
    }
}

module.exports = fetchuser;