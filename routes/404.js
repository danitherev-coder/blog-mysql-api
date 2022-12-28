import express from "express"

const router = express.Router()

//TODO
router.get('*', (req, res) => {
    res.status(404).send("Página no ")
})

router.get('/*', (req, res) => {
    res.status(404).send("Página no encontrada")
})

export default router