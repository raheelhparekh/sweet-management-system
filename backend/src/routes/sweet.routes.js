import express from "express";
import {
  addSweet,
  getSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from "../controllers/sweet.controllers.js";
import protect from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/", protect, addSweet);

router.get("/", getSweets);

router.get("/search", searchSweets);

router.put("/:id", protect, updateSweet);

router.delete("/:id", protect, admin, deleteSweet);

router.post("/:id/purchase", protect, purchaseSweet);

router.post("/:id/restock", protect, admin, restockSweet);

export default router;
