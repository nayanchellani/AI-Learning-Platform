import express from "express";
import { smartSearchController } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", smartSearchController);

export default router;
