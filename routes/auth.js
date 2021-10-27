const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser")

dotenv.config();
const jwtSignature = process.env.JWT_SIGNATURE

// ROUTE 1: SIGN UP (NO-AUTH)
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ errors: error.array() })
        }
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ error: 'A user already exists.' })
        }
        const salt = await bcrypt.genSalt(10);
        const sequirePassword = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: sequirePassword
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(data, jwtSignature)
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

// ROUTE 2: LOGIN (NO-AUTH)
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').exists()
], async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json({ errors: 'Wrong credentials.' })
        }
        const { email, password } = req.body;
        let user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ error: 'Wrong credentials.' })
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: 'Wrong credentials.' })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(data, jwtSignature)
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

// ROUTE 3: GET USER DATA (AUTH)
router.get("/getuser", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);
    } catch (error) {
        res.status(500).json({ error: "Some Error Occured" })
    }
})

module.exports = router