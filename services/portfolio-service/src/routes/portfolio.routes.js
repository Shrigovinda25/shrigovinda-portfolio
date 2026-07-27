'use strict';

const express = require('express');
const portfolioController = require('../controllers/portfolio.controller');

const router = express.Router();

// ── Portfolio Endpoints ────────────────────────────────────────────────────────
router.get('/projects',      portfolioController.getProjects);
router.get('/projects/:id',  portfolioController.getProjectById);
router.get('/skills',        portfolioController.getSkills);
router.get('/education',     portfolioController.getEducation);
router.get('/experience',    portfolioController.getExperience);
router.get('/achievements',  portfolioController.getAchievements);
router.get('/owner',         portfolioController.getOwner);
router.get('/resume',        portfolioController.getResumeInfo);

module.exports = router;
