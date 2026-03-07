import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getMyRegistrations,
  getRegistrationStatus, 
} from "../controllers/registrationController.js";

const router = express.Router();

router.get("/my", protect, getMyRegistrations);
router.get("/status/:eventId", protect, getRegistrationStatus);

export default router;
