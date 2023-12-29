const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/views.controller");

router.get("/users_process/", viewsController.userProcess);
router.get("/:process/:year", viewsController.getObjetiveByProcess);
router.get(
  "/current/:process/:year",
  viewsController.getObjetiveCurrentByProcess
);

module.exports = router;
