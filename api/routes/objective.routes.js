const express = require("express");
const router = express.Router();
const objectiveController = require("../controllers/objective.controller");

router.get("/:month/:year/:process", objectiveController.getObjetive);
router.put("/achievement", objectiveController.updateAchievement);
router.post("/", objectiveController.createObjetive);
router.put("/", objectiveController.updateObjetive);
router.delete("/:id", objectiveController.deleteObjetive);

module.exports = router;
