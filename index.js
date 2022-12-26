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
  origin: [/\.netlify\.app$/, "https://hilarious-cobbler-0478cd.netlify.app"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization ", "Access-Control-Allow-Credentials"], 
}))
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://hilarious-cobbler-0478cd.netlify.app");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept", "Authorization", "Access-Control-Allow-Credentials");
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });


app.use(cookieParser());
app.use(express.urlencoded({ limit: maxRequestSize, extended: true }));
app.use(express.json({ limit: maxRequestSize }));

cloudinary.v2.config({
  cloud_name: 'dpvk1flpp',
  api_key: '751537179855646',
  api_secret: '7OrSXAXhbbwJ45YYpbXq48LnbeY'
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../client/public/upload");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });



const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImage = (imageBase64) => {
  // Configuramos las opciones para la subida
  const options = {
    resource_type: "image",
    file: imageBase64
  };
  return new Promise((resolve, reject) => {
    // Subimos la imagen a Cloudinary
    cloudinary.uploader.upload(imageBase64, options, function (error, result) {
      if (error) {
        console.error(error);
        reject(error);
      }
      if (result.public_id) {
        resolve(result.public_id);
      } else {
        reject(new Error("Error al subir el archivo"));
      }
    });
  });
};

app.post("/api/upload", upload.single("file"), function (req, res, next) {
  const file = req.file;

  // Si la imagen no se ha proporcionado, mostramos un mensaje de error
  if (!file) {
    return res.status(400).json({ message: "No se ha proporcionado ningún archivo" });
  }
  // Convertimos el buffer de la imagen en una cadena de base64
  const imageBase64 = file.buffer.toString("base64");

  // Subimos la imagen a Cloudinary
  uploadImage(imageBase64)
    .then(publicId => {
      res.status(200).json({ message: "Archivo subido correctamente", publicId });
    }).catch(error => {
      console.log(error)
      res.status(500).json({ message: "Error al subir el archivo" });
    });
});


// app.post("/api/upload", upload.single("file"), function (req, res) {
//   const file = req.file;

//   // si la imagen no se sube, entonces mostrar la imagen anterior si existe, sino, dejarlo vacío
//   if (!file) {
//     const error = new Error("No File");
//     error.httpStatusCode = 400;
//     return res.status(400).json("No File");
//   }

//   try {
//     // Código para procesar la imagen y guardarla en el servidor
//   } catch (error) {
//     // Manejo del error 500 aquí
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }

//   res.status(200).json(file.filename);
// });

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(process.env.PORT || 8800, () => {
  console.log("Connected!");
});
