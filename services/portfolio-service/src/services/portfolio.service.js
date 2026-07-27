'use strict';

const DATA = require('../data/portfolio.data');

/**
 * Portfolio Service — pure data access layer.
 * All methods are synchronous (data is in-memory static JSON).
 * Swap implementations here if data ever moves to Firestore/DB.
 */

function getProjects({ featured } = {}) {
    if (featured === 'true' || featured === '1') {
        return DATA.projects.filter(p => p.featured);
    }
    return DATA.projects;
}

function getProjectById(id) {
    return DATA.projects.find(p => p.id === id) || null;
}

function getSkills() {
    return DATA.skills;
}

function getEducation() {
    return DATA.education;
}

function getExperience() {
    return DATA.experience;
}

function getAchievements() {
    return DATA.achievements;
}

function getOwner() {
    return DATA.owner;
}

function getResumeInfo() {
    return DATA.resume;
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
