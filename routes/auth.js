const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')

dotenv.config();

const jwtSignature = process.env.JWT_SIGNATURE
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
        console.error(error.message)
        res.status(500).json({ error: "Some Error Occured" })
    }
})

module.exports = router