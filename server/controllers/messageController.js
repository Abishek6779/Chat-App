const Message = require("../models/Message");

// Send Message
const sendMessage = async (req, res) => {

    try {

        const { receiver, text } = req.body;

        const message = await Message.create({

            sender: req.user.id,
            receiver,
            text

        });

        res.status(201).json(message);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// Get Messages
const getMessages = async (req, res) => {

    try {

        const { id } = req.params;

        const messages = await Message.find({

            $or: [

                {
                    sender: req.user.id,
                    receiver: id
                },

                {
                    sender: id,
                    receiver: req.user.id
                }

            ]

        }).sort({
            createdAt: 1
        });

        res.json(messages);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    sendMessage,
    getMessages
};