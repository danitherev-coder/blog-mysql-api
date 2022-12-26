import express from "express";
import { body } from "express-validator";
import { register, login, logout } from "../controllers/auth.js";
// import { emailExiste, usernameExiste } from "../helpers/validarDB.js";
import { validarCampos } from '../middlewares/validarCampos.js'

const router = express.Router();

router.post("/register", [
    body('username', 'El nombre de usuario es obligatorio').not().isEmpty(),    
    body('email', 'El email no es valido').isEmail(),    
    body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    validarCampos
], register);

router.post("/login", [
    body('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    body('password', 'Ingrese una contraseña').not().isEmpty(),
    validarCampos
],login);

router.post("/logout", logout);

export default router;
