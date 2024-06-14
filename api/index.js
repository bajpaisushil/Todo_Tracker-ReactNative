import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import { User } from "./models/user.js";
import { Todo } from "./models/todo.js";
import jwt from "jsonwebtoken";
import moment from "moment";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};
const secretKey = generateSecretKey();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
mongoose
  .connect(process.env.DB_URL)
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("DB Error->", err);
  });

app.get("/ping", async (req, res) => {
  res.json("pong");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered");
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    res
      .status(202)
      .json({ messsage: "User regsitered successfully", user: newUser });
  } catch (error) {
    console.log("Error registeration=>", error);
    res.status(500).json({ message: "Registration Failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid Email" });
    }
    if (user.password !== password) {
      res.status(401).json({ message: "Invalid Password" });
    }
    const token = jwt.sign({ userId: user._id }, secretKey);
    console.log('user._id=', user._id );
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.log("Error login=>", error);
    res.status(500).json({ message: "Login Failed" });
  }
});

app.post("/todos/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('userId todos', userId);
    console.log('req.body', req.body);
    const { title, category } = req.body;
    const newTodo = new Todo({ title, category, dueDate: moment().format("YYYY-MM-DD") });
    const newtodo=await newTodo.save();
    console.log('newtodo', newtodo);
    const user=await User.findById({_id: userId});
    console.log('useruser', user);
    if(!user){
        res.status(404).json({error: "User not found"})
    }
    user?.todos?.push(newTodo._id);
    await user.save();
    res.status(200).json({message: "Todo added successfully", todo: newTodo});
  } catch (error) {
    res.status(500).json({message: "Todo not added"});
  }
});

app.get("/users/:userId/todos", async(req, res)=>{
  // await Todo.deleteMany({});

    try {
        const userId=req.params.userId;
        const user=await User.findById({_id: userId}).populate("todos");
        console.log('usertodos-', user);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({todos: user.todos});
    } catch (error) {
        res.status(500).json({message: "Todo not added for user"});
    }
})

app.patch("/todos/:todoId/complete", async(req, res)=>{
    try {
        const todoId=req.params.todoId;
        const udpatedTodo=await Todo.findByIdAndUpdate(todoId, {
            status: "completed",
        }, {new: true});
        if(!udpatedTodo){
            return res.status(404).json({error: "Todo not found"})
        }
        res.status(200).json({message: "Todo marked as completed", todo: udpatedTodo});
    } catch (error) {
        res.status(500).json({error: "Something went wrong"});
    }
})

app.get("/todos/completed/:date", async (req, res) => {
  try {
    const date = req.params.date;

    const completedTodos = await Todo.find({
      status: "completed",
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
    }).exec();

    res.status(200).json({ completedTodos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/todos/count", async(req, res)=>{
  try {
    const totalCompletedTodos=await Todo.countDocuments({
      status: "completed",
    }).exec();
    const totalPendingTodos=await Todo.countDocuments({
      status: "pending",
    }).exec();
    res.status(200).json({totalCompletedTodos, totalPendingTodos});
  } catch (error) {
    res.status(500).json({error: "Network Error"});
  }
})


app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
