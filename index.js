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
  origin: /\.netlify\.app$/
}))

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

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, file.buffer);
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

  try {
    // Subimos el archivo a Cloudinary
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, function(error, result) {
      // Si hay un error, manejamos el error 500 aquí
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // Si se subió correctamente, devolvemos el resultado
      res.status(200).json({result, msg: "se subio correctamente"});
    }).end(file.buffer);
  } catch (error) {
    // Manejo del error 500 aquí
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
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

app.listen(process.env.PORT || 3000, () => {
  console.log("Connected!");
});
