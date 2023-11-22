const express = require("express");
const router = express.Router();
const sacController = require("../controllers/sac.controller");

router.get("/", sacController.getSacRecords);
router.post("/", sacController.createSacRecord);
router.put("/", sacController.updateSacRecord);
router.delete("/:id", sacController.deleteSacRecord);

module.exports = router;
