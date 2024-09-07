import express from "express";
import { getUser, login, logout, register, deleteUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router()

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getUser", isAuthenticated, getUser);
router.delete("/deleteUser", isAuthenticated, deleteUser); // New delete route

export default router;
