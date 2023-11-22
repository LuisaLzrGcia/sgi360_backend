const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Obtener todos los usuarios
router.get("/", userController.getUsers);

// Obtener un usuario por su ID
router.get("/:id", userController.getUserById);

// Crear un nuevo usuario
router.post("/", userController.createUser);

// Actualizar un usuario por su ID
router.put("/", userController.updateUser);

// Borrar un usuario por su ID
router.delete("/:idUser", userController.deleteUser);

module.exports = router;
