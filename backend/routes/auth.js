const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");

const JWT_SECRET = "$iknowiamawesome$999"; //signature for jwt

//Route 1: Create a User using POST: "/api/auth/createuser". No login required
router.post("/createuser", [body("name", "Enter a valid name").isLength({ min: 3 }),
body("email", "Enter a valid email").isEmail(),
body("password", "Password must be atleast 5 characters").isLength({ min: 5 })
], async (req, res) => {
    //if there are errors & send bad request and errors - after validations
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() })
    }
    try {
        //check wheather the user with same email exist already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with same email already exists" })
        }
        //Create a new user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hash
        });

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)

        res.json({ authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 2: Authenticate a User using: POST "api/auth/login." No login required
router.post("/login", [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists()
], async (req, res) => {
    //if there are errors & send bad request and errors - after validations
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() })
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to log with correct Credentials" })
        }

        const passwordCompare = bcrypt.compareSync(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to log with correct Credentials" })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)

        res.json({ authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 3: Get logged in User details using: POST "api/auth/getuser." login required
router.post("/getuser", fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;