const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Registration Successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                online: user.online
            }
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= LOGIN =================

const login = async (req, res) => {
    try {
        console.log("LOGIN REQUEST:", req.body);

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        console.log("USER:", user);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("PASSWORD MATCH:", isMatch);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log("TOKEN CREATED");

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                online: user.online
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
module.exports = {
    register,
    login
};