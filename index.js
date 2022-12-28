import fs from "fs"
import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from 'cors'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary';
dotenv.config()

const maxRequestSize = "50mb"
const app = express();
// const uid = new ShortUniqueId({ length: 5 })


app.use(cors({
  origin: "https://dancing-elf-50ff80.netlify.app"
}))
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "https://dancing-elf-50ff80.netlify.app");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept", "Authorization", "Access-Control-Allow-Credentials");
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ limit: maxRequestSize, extended: true }));
app.use(express.json({ limit: maxRequestSize }));

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   // cb(null, "../../client/public/upload");
  //   cb(null,'../client/public/upload/')
  // },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ msg: "No se ha subido ningún archivo o ha ocurrido un error al subir el archivo." });
  }
  try {
    console.log(req.file.path);
    const uploadResponse = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'test',
      // width: 300,
      // height: 300,
      // crop: "fill",
      // reducir pixeles de la imagen
      // quality: "50",
      // reducir tamaño de la imagen
      q_auto: "good",
      public_id: Math.random() + "_image"
    });

    res.json({ msg: "File uploaded", uploadResponse, url: uploadResponse.public_id });
    // res.json({ msg: "File uploaded", uploadResponse, url: uploadResponse.url });

  } catch (error) {
    // Maneja el error aquí
    console.error(error);
    res.status(500).json({ msg: "Error uploading file" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(process.env.PORT || 8800, () => {
  console.log("Connected!");
});

