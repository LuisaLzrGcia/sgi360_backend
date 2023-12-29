const express = require("express");
const router = express.Router();
const userProcessController = require("../controllers/userProcess.controller");

router.get("/:process", userProcessController.getProcess);

module.exports = router;
