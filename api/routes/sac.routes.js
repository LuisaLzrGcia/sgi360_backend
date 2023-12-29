const express = require("express");
const router = express.Router();
const sacController = require("../controllers/sac.controller");

router.post("/filter", sacController.getSacRecords);
router.post("/", sacController.createSacRecord);
router.put("/", sacController.updateSacRecord);
router.delete("/:id", sacController.deleteSacRecord);
router.get("/:audit", sacController.getSACCode);

module.exports = router;
