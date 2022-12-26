import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const maxRequestSize = "50mb"
const app = express();
// const uid = new ShortUniqueId({ length: 5 })


app.use(cors({
  origin: ["https://hilarious-cobbler-0478cd.netlify.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]  
}))

app.use(cookieParser());
app.use(express.urlencoded({ limit: maxRequestSize, extended: true }));
app.use(express.json({ limit: maxRequestSize }));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  const file = req.file;

  // si la imagen no se sube, entonces mostrar la imagen anterior si existe, sino, dejarlo vacío
  if (!file) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return res.status(400).json("No File");
  }

  res.status(200).json(file.filename);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Connected!");
});
