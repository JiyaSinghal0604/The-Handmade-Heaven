const express = require("express");
const router = express.Router();

const {
    loginAdmin,
    registerAdmin,
    loginUser,
    registerUser
} = require("../controllers/authController");

// ---------------- ADMIN ----------------

// Seed first admin (only once)
router.post("/admin/register", registerAdmin);

// Admin Login
router.post("/admin/login", loginAdmin);

// ---------------- CUSTOMER ----------------

// Customer Register
router.post("/register", registerUser);

// Customer Login
router.post("/login", loginUser);

module.exports = router;