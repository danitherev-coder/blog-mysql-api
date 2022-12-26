import { db } from "../db.js";
import jwt from "jsonwebtoken";
import fs from "fs";
// const path = require("path")
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPosts = (req, res) => {
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 5;

  const q = req.query.cat
    ? `SELECT * FROM posts WHERE cat=? ORDER BY date DESC LIMIT ? OFFSET ?`
    : `SELECT * FROM posts ORDER BY date DESC LIMIT ? OFFSET ?`;

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
    q = "SELECT * FROM posts WHERE cat=? ORDER BY date DESC LIMIT ? OFFSET ?";
    params = [cat, pageSize, (page - 1) * pageSize];
  } else {
    q = "SELECT * FROM posts ORDER BY date DESC LIMIT ? OFFSET ?";
    params = [pageSize, (page - 1) * pageSize];
  }

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {
  const q = "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`,`date`, `updatedAt` FROM users AS u JOIN posts p ON u.id = p.uid WHERE p.id = ?";


  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });

};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

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

// export const deletePost = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) return res.status(401).json("Not authenticated!");

//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) return res.status(403).json("Token is not valid!");

//     const postId = req.params.id;
//     const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

//     db.query(q, [postId, userInfo.id], (err, data) => {
//       if (err) return res.status(403).json("You can delete only your post!");

//       return res.json("Post has been deleted!");
//     });
//   });
// };


// este codigo me lo dio CHATGPT

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;


    const q = "SELECT img FROM posts WHERE `id` = ? AND `uid` = ?";
    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post!");
      // console.log(userInfo.id);

      if (data.length > 0) {
        // retrieve the image path from the database
        // const imagePath = data[0].img;
        const imagePath = (path.join(__dirname, `../../client/public/upload/${data[0].img}`))
        console.log(path.join(__dirname, `../../client/public/upload/${data[0].img}`))
        // console.log(imagePath);
        // conseguir la ruta de la imagen de la base de datos


        // delete the image file
        fs.unlink(imagePath, (err) => {
          // comente esta linea porque no me permitia borrar el post porque no subi una imagen
          // if (err) return res.status(500).json("Error deleting image file");

          // delete the post from the database
          const q = "DELETE FROM posts WHERE `id` = ?";
          db.query(q, [postId], (err, data) => {
            if (err) return res.status(500).json("Error deleting post");
            return res.json("Post and image have been deleted!");
          });
        });
      } else {
        // if the post does not have an image, just delete the post from the database
        const q = "DELETE FROM posts WHERE `id` = ?";
        db.query(q, [postId], (err, data) => {
          if (err) return res.status(500).json("Error deleting post");
          return res.json("Post has been deleted!");
        });
      }
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id` = ? AND `uid` = ?";

    const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      console.log(data);
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated.");
    });
  });
};
