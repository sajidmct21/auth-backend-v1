import express from "express";
import env from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import dbConnection from './database/dbConnection.js'


const app = express();
env.config();
app.use(cors());

// Middlewares
app.use(express.json());

// app.use("/", (req, res) => {
//   res.send(`Hello from backend and TaskDB`);
// });
// app.use('/api/v2',verifyToken,taskRouter)

app.use("/api/user", userRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.statusCode).json({
    statusCode: err.statusCode,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
});

const port = 3000;
dbConnection()
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
