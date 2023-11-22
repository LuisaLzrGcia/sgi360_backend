const express = require("express");
const router = express.Router();
const processController = require("../controllers/process.controller");

router.get("/", processController.getProcesses);
router.post("/", processController.createProcess);
router.put("/", processController.updateProcess);
router.delete("/:id", processController.deleteProcess);

module.exports = router;
