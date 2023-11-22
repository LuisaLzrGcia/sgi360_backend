const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/views.controller");

// Login
router.get("/users_process", viewsController.userProcess );

module.exports = router;