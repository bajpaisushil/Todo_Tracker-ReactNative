import mongoose, { Schema, model } from "mongoose";

const todoSchema=new Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: "pending"
    },
    category: {
        type: String,
        required: true,
    },
    dueDate: {
        type: String,
        required: true,
    },
}, {timestamps: true})

export const Todo=model("Todo", todoSchema);
