const jwt = require("jsonwebtoken");
const JWT_SECRET = "$iknowiamawesome$999"; //signature for jwt


const fetchuser = (req, res, next) => {
    //Get the user from jwt token and add id to request object
    const token = req.header("auth-token");
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" })  //access denied 401
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })  //access denied 401
    }
}

module.exports = fetchuser;