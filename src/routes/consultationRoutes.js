const express = require("express");
const router = express.Router();
const controller = require("../controllers/ConsultationController");

router.get("/", controller.getAll);
router.get("/history", controller.history);
router.get("/:id", controller.getById);
router.get("/:id/registrations", controller.getRegistrations);
router.post("/", controller.create);
router.post("/:id/register", controller.register);

module.exports = router;
