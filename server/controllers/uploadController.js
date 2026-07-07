const User = require("../models/User");

exports.uploadProfile = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });

        }

        const user = await User.findByIdAndUpdate(

            req.body.userId,

            {
                profilePic: req.file.path
            },

            {
                new: true
            }

        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.json({

            success: true,
            profilePic: user.profilePic

        });

    }

    catch (err) {

        console.log("========== UPLOAD ERROR ==========");
        console.error(err);
        console.log("==================================");

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};