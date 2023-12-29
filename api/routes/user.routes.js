const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/", userController.updateUser);
router.delete("/:idUser", userController.deleteUser);

module.exports = router;
