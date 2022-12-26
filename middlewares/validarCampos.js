import { validationResult } from "express-validator";


const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ message: errores.array() })
    }

    console.log(errores)
    next()
}

export {
    validarCampos
}
