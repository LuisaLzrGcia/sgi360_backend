const express = require("express");
const router = express.Router();
const documentsController = require("../controllers/documents.controller");

router.get("/", documentsController.getDocuments);
router.get("/:process/:type/:status", documentsController.getDocumentsByProcess);
router.post("/", documentsController.createDocument);
router.put("/", documentsController.updateDocument);
router.delete("/:id", documentsController.deleteDocument);

module.exports = router;
