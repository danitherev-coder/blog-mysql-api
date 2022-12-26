import express from "express";
import { body } from "express-validator";
import {
  addPost,
  deletePost,
  getCategories,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/post.js";
import { validarCampos } from '../middlewares/validarCampos.js'

const router = express.Router();

router.get("/", getPosts);
router.get('/categories', getCategories);
router.get("/:id", getPost);
router.post("/", [
  body('title', 'EL titulo es obligatorio').notEmpty(),
  body('cat', 'La categoria es obligatoria').notEmpty(),
  body('img', 'La imagen es obligatoria').notEmpty(),
  body('desc','La descripcion es obligatoria').notEmpty(),
  validarCampos
], addPost);
router.delete("/:id", deletePost);
router.put("/:id", updatePost);

export default router;
