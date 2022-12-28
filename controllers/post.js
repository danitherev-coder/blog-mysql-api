import { db } from "../db.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from 'url';
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import cloudinary from 'cloudinary';
import { request, response } from "express";

export const getPosts = (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 5;

  const q = req.query.cat
    ? `SELECT * FROM posts WHERE cat=? ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    : `SELECT * FROM posts ORDER BY createdAt DESC LIMIT ? OFFSET ?`;

  const params = req.query.cat
    ? [req.query.cat, parseInt(pageSize), parseInt((page - 1) * pageSize)]
    : [parseInt(pageSize), parseInt((page - 1) * pageSize)];

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(data);
  });

};


export const getCategories = (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 5;
  const cat = req.query.cat;

  let q;
  let params;

  // Si se especificó una categoría, incluye el filtro en la consulta
  if (cat) {
    q = "SELECT * FROM posts WHERE cat=? ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params = [cat, pageSize, (page - 1) * pageSize];
  } else {
    q = "SELECT * FROM posts ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params = [pageSize, (page - 1) * pageSize];
  }

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(data);
  });
};

// export const getPost = (req, res) => {

//   const q = "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`,`date`, `updatedAt` FROM users AS u JOIN posts p ON u.id = p.uid WHERE p.id = ?";


//   db.query(q, [req.params.id], (err, data) => {
//     if (err) return res.status(500).json(err);
//     return res.status(200).json(data[0]);
//   });

// };

export const getPost = (req, res) => {
  const postId = req.params.id;
  const timeLimit = 1 * 60 * 1000;
  const startTime = new Date().getTime();

  const q = "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`,`date`, `updatedAt`,`createdAt` FROM users AS u JOIN posts p ON u.id = p.uid WHERE p.id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);

    const elapsedTime = new Date().getTime() - startTime;
    if (elapsedTime > timeLimit) {
      res.redirect("http://localhost:3000/");
    } else {
      return res.status(200).json(data[0]);
    }
  });
};

export const addPost = (req = request, res = response) => {
  const token = req.header("x-access-token");
  console.log(token)
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Agrega la validación para verificar el valor del campo img
    if (!req.body.img) {
      return res.status(400).json({ msg: "Debe proporcionar una imagen para el post." });
    }

    const q =
      "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`,`uid`, `updatedAt`) VALUES (?, NULL)";
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];


    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been created.");
    });
  });
};


// obtener la imagen de cloudinary
const deleteImg = (imagePublicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(imagePublicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({ result, msg: 'Imagen eliminada' });
      }
    });
  });
};


export const deletePost = (req, res) => {
  const token = req.header("x-access-token");
  console.log(token)
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const postId = req.params.id;
    const q = "SELECT img FROM posts WHERE `id` = ? AND `uid` = ?";
    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post!");
      // console.log(userInfo.id);

      if (data.length > 0) {
        const imagePublicId = data[0].img;
        // si no existe una imagen, entonces simplemente borrar el post de la base de datos
        if (!imagePublicId) {
          const q = "DELETE FROM posts WHERE `id` = ?";
          db.query(q, [ postId], (err, data) => {
            if (err) return res.status(500).json("Error deleting post");
            return res.json("Post has been deleted!");
          });
        }else{
          deleteImg(imagePublicId)
          .then(() => {
            // eliminar el post de la base de datos
            const q = "DELETE FROM posts WHERE `id` = ?";
            db.query(q, [postId], (err, data) => {
              if (err) return res.status(500).json("Error deleting post");
              return res.json("Post and image have been deleted!");
            });
          })
          .catch((error) => {
            console.log(error)
            return res.status(500).json("Error deleting image from Cloudinary");
          });
        }

        
      } 
    });
  });
};


export const updatePost = (req, res) => {
  const token = req.header("x-access-token");
  console.log("token", token)
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id` = ? AND `uid` = ?";

    const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];
    console.log("valores", values);
    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      console.log("no data", data);
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated.");
    });
  });
};

