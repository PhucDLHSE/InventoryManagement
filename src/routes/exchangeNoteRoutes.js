const express = require("express");
const router = express.Router();
const exchangeNoteController = require("../controllers/exchangeNoteController");
const { ROLE_TYPES } = require('../constants/roles');
const { verifyToken, verifyAdmin, verifyManager } = require('../middleware/authMiddleware');


router.get("/", verifyToken, verifyAdmin, verifyManager, exchangeNoteController.getAllExchangeNotes);
router.post("/:exchangeNoteId/approve", verifyToken, verifyAdmin, verifyManager, exchangeNoteController.approveExchangeNote);

router.post("/import", verifyToken, exchangeNoteController.createImportNote);

module.exports = router;
