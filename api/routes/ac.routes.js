const express = require("express");
const router = express.Router();
const acController = require("../controllers/ac.controller");

router.get("/:audit/:sac", acController.getSACCode);
router.post("/", acController.createAC);
router.put("/", acController.updateAC);
router.delete("/:id", acController.deleteAC);

module.exports = router;
