const express = require("express");
const {getDashboardStats,} = require("../controllers/dashboardController");
const { protectedMiddleware, adminMiddleware } = require("../middleware/authMiddleware");


const dashboardRouter = express.Router();
// GET DASHBOARD STATS
dashboardRouter.get("/stats", protectedMiddleware, adminMiddleware, getDashboardStats);

module.exports = dashboardRouter;