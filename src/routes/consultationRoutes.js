const express = require("express");
const router = express.Router();
const controller = require("../controllers/ConsultationController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/", controller.getAll);
router.get("/history", controller.history);
router.get("/:id", controller.getById);
router.get("/:id/registrations", controller.getRegistrations);
router.post("/", requireRole("teacher"), controller.create);
router.post("/:id/register", requireRole("student"), controller.register);

module.exports = router;
