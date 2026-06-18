import express from "express";
import { register, login} from "../controllers/authController.controller.js";

const router=express.Router();


router.post("/login",login);
router.post('/register', (req, res, next) => {
    console.log('Register request body:', req.body);
    next(); // Pass control to the 'register' function below
}, register);

export default router;
