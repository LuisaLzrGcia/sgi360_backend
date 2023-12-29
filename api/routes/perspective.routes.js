const express = require("express");
const router = express.Router();
const perspectiveController = require("../controllers/perspective.controller");

router.get("/", perspectiveController.getPerspectives);
router.post("/", perspectiveController.createPerspective);
router.put("/", perspectiveController.updatePerspective);
router.delete("/:id", perspectiveController.deletePerspective);

module.exports = router;
