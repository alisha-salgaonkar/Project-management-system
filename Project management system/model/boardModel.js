const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema(
    {
        title: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

const listSchema = new Schema(
    {
        title: {
            type: String,
            default: ''
        },
        cards: [cardSchema]
    },
    { timestamps: true }
);

const userSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const boardSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        // users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        users: [userSchema],
        list: [listSchema],
        status: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
