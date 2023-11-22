const express = require("express");
const router = express.Router();
const standarController = require("../controllers/standar.controller");

router.get("/", standarController.getStandar);
router.post("/", standarController.createStandar);
router.put("/", standarController.updateStandar);
router.delete("/:id", standarController.deleteStandar);

module.exports = router;
