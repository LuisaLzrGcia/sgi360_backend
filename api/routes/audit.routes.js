const express = require("express");
const router = express.Router();
const auditController = require("../controllers/audit.controller");

router.post("/filter", auditController.getAudit);
router.post("/", auditController.createAudit);
router.put("/", auditController.updateAudit);
router.delete("/:id", auditController.deleteAudit);
router.get("/standar/:standar/:year", auditController.getAuditByStandar);

module.exports = router;
