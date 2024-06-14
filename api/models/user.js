import mongoose, { Schema, model } from "mongoose";

const userSchema=new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    todos: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Todo',
        }
    ],
    // createdAt: 
}, {timestamps: true})

export const User=model("User", userSchema);
