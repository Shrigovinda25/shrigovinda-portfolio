'use strict';

const portfolioService = require('../services/portfolio.service');

const getProjects     = (req, res, next) => wrap(res, next, () => portfolioService.getProjects(req.query));
const getProjectById  = (req, res, next) => wrap(res, next, () => portfolioService.getProjectById(req.params.id));
const getSkills       = (req, res, next) => wrap(res, next, () => portfolioService.getSkills());
const getEducation    = (req, res, next) => wrap(res, next, () => portfolioService.getEducation());
const getExperience   = (req, res, next) => wrap(res, next, () => portfolioService.getExperience());
const getAchievements = (req, res, next) => wrap(res, next, () => portfolioService.getAchievements());
const getOwner        = (req, res, next) => wrap(res, next, () => portfolioService.getOwner());
const getResumeInfo   = (req, res, next) => wrap(res, next, () => portfolioService.getResumeInfo());

/**
 * Generic response wrapper — DRY async handler.
 * Resolves service call and wraps result in standard { success, data } envelope.
 */
async function wrap(res, next, fn) {
    try {
        const data = await fn();
        if (data === null || data === undefined) {
            return res.status(404).json({ success: false, error: 'Resource not found.' });
        }
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getProjects,
    getProjectById,
    getSkills,
    getEducation,
    getExperience,
    getAchievements,
    getOwner,
    getResumeInfo,
};
