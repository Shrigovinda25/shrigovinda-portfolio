'use strict';

/**
 * Portfolio Static Data
 * ─────────────────────
 * This file is the single source of truth for all portfolio content.
 * Edit this file to update projects, skills, education, and experience
 * without touching any service or frontend logic.
 */

const PORTFOLIO_DATA = {

    // ── Owner Info ────────────────────────────────────────────────────────────
    owner: {
        name:     'Shrigovinda T Kulkarni',
        title:    'Automation & Robotics Engineer | AI + Robotics Developer',
        email:    'shrigovindak@gmail.com',
        phone:    '+91 8618104226',
        location: 'Hubballi, Karnataka, India',
        linkedin: 'https://www.linkedin.com/in/shrigovinda-kulkarni-299399284/',
        github:   'https://github.com/',
        instagram:'https://www.instagram.com/shrigovinda_/',
        whatsapp: 'https://wa.me/918618104226',
    },

    // ── Projects ──────────────────────────────────────────────────────────────
    projects: [
        {
            id: 'autonomous-tunnel-robot',
            title: 'Autonomous Tunnel Inspection Robot',
            subtitle: 'MATLAB Virtual Simulation',
            description: 'A virtual simulation of an autonomous robot designed for tunnel inspection using MATLAB. Features obstacle detection, path planning, and real-time sensor fusion.',
            tags: ['MATLAB', 'Robotics', 'Simulation', 'Sensor Fusion'],
            image: '/assets/Autonomous Tunnel Inspection Robot - MATLAB Virtual Simulation.png',
            report: '/assets/Autonomous Tunnel Inspection Robot – MATLAB Virtual Simulation Report.pdf',
            featured: true,
        },
        {
            id: 'buildverse',
            title: 'BuildVerse',
            subtitle: 'Construction Management Platform',
            description: 'A full-stack construction project management platform with real-time collaboration features, resource tracking, and AI-assisted progress reporting.',
            tags: ['Web App', 'Full Stack', 'AI', 'Management'],
            image: '/assets/BuildVerse.png',
            featured: true,
        },
        {
            id: 'hydrohive',
            title: 'HydroHive',
            subtitle: 'Smart Terrace Watering System',
            description: 'An IoT-based smart watering system for terrace gardens. Uses soil moisture sensors, weather APIs, and automated valve control to optimize water usage.',
            tags: ['IoT', 'ESP32', 'Sensors', 'Automation'],
            image: '/assets/HydroHive – Smart Terrace Watering System.jpg',
            report: '/assets/HydroHive – Smart Terrace Watering System Report.pdf',
            featured: true,
        },
        {
            id: 'ugv-navigation',
            title: 'Outdoor Autonomous Navigation Framework',
            subtitle: 'UGV with ROS2',
            description: 'Development and performance validation of an outdoor autonomous navigation framework for Unmanned Ground Vehicles using ROS2, GPS, and LiDAR.',
            tags: ['ROS2', 'Navigation', 'UGV', 'LiDAR', 'GPS'],
            image: '/assets/Development and Performance Validation of an Outdoor Autonomous Navigation Framework for UGV.jpg',
            featured: false,
        },
        {
            id: 'person-following-robot',
            title: 'Person Following Robot',
            subtitle: 'Computer Vision & ROS',
            description: 'A mobile robot that autonomously follows a designated person using computer vision (YOLOv8) and ROS-based control architecture.',
            tags: ['Computer Vision', 'YOLOv8', 'ROS', 'Python'],
            image: '/assets/Person Following Robot.png',
            report: '/assets/Person Following Robot.pdf',
            featured: false,
        },
        {
            id: 'conveyor-sorting',
            title: 'Conveyor Sorting System',
            subtitle: 'PLC-Based Weight Sorting',
            description: 'Simulation and PLC-based control of a weight-based conveyor sorting system using Factory IO and Siemens TIA Portal.',
            tags: ['PLC', 'SCADA', 'Factory IO', 'TIA Portal'],
            image: '/assets/Simulation and PLCBased Control of a WeightBased Conveyor Sorting System Using Factory IO and.png',
            report: '/assets/Simulation and PLCBased Control of a WeightBased Conveyor Sorting System.pdf',
            featured: false,
        },
        {
            id: 'solar-tracking',
            title: 'Single Axis Solar Tracking System',
            subtitle: 'Arduino & LDR Sensors',
            description: 'A single-axis solar tracking system that maximizes solar panel efficiency by automatically orienting toward the sun using LDR sensors and servo motors.',
            tags: ['Arduino', 'Electronics', 'LDR', 'Servo'],
            image: '/assets/Single Axis Solar Tracking System.png',
            report: '/assets/Single Axis Solar Tracking System.pdf',
            featured: false,
        },
        {
            id: 'self-balancing-robot',
            title: 'Self Balancing Robot',
            subtitle: 'PID Control & MPU6050',
            description: 'A two-wheeled self-balancing robot using PID control with MPU6050 IMU sensor for real-time attitude estimation and correction.',
            tags: ['PID', 'IMU', 'Arduino', 'Control Systems'],
            image: '/assets/Self Balancing Robot.jpeg',
            featured: false,
        },
        {
            id: 'can-crusher',
            title: 'Pneumatic Can Crusher',
            subtitle: 'Mechanical Design Project',
            description: 'A pneumatically actuated automated can crusher for industrial recycling applications, designed with SolidWorks and validated through FEA.',
            tags: ['Pneumatics', 'SolidWorks', 'FEA', 'Mechanical Design'],
            image: '/assets/Can Crusher.jpeg',
            featured: false,
        },
        {
            id: 'signal-mixer',
            title: 'Multichannel Analog Signal Mixer',
            subtitle: 'Op-Amp Circuit Design',
            description: 'A precision multichannel analog audio signal mixer designed with operational amplifiers, supporting independent gain and volume control per channel.',
            tags: ['Op-Amp', 'Circuit Design', 'Electronics', 'Analog'],
            image: '/assets/Multichannel Analog Signal Mixer.jpeg',
            featured: false,
        },
    ],

    // ── Skills ────────────────────────────────────────────────────────────────
    skills: {
        robotics: [
            { name: 'ROS2',            level: 85 },
            { name: 'MATLAB/Simulink', level: 88 },
            { name: 'PLC Programming', level: 82 },
            { name: 'SCADA',           level: 75 },
            { name: 'Computer Vision', level: 80 },
            { name: 'Sensor Fusion',   level: 78 },
        ],
        programming: [
            { name: 'Python',      level: 85 },
            { name: 'C++',         level: 72 },
            { name: 'JavaScript',  level: 78 },
            { name: 'MATLAB',      level: 88 },
            { name: 'Bash/Linux',  level: 65 },
        ],
        ai: [
            { name: 'YOLOv8',           level: 80 },
            { name: 'OpenCV',           level: 78 },
            { name: 'TensorFlow (basic)',level: 60 },
            { name: 'Generative AI',    level: 70 },
        ],
        tools: [
            { name: 'SolidWorks',    level: 82 },
            { name: 'Factory IO',    level: 85 },
            { name: 'TIA Portal',    level: 78 },
            { name: 'Arduino IDE',   level: 90 },
            { name: 'Firebase',      level: 75 },
            { name: 'Git/GitHub',    level: 80 },
            { name: 'Linux (Ubuntu)',level: 70 },
        ],
    },

    // ── Education ─────────────────────────────────────────────────────────────
    education: [
        {
            id:           'be-robotics',
            degree:       'B.E. Automation & Robotics',
            institution:  'KLE Technological University (BVB)',
            location:     'Hubballi, Karnataka',
            period:       '2023 – 2027 (Expected)',
            grade:        'CGPA: 9.27',
            gradeType:    'cgpa',
            gradeValue:   9.27,
        },
        {
            id:           'puc',
            degree:       'Pre-University (PUC)',
            institution:  'JSS RSH PU College',
            location:     'Karnataka',
            period:       '2021 – 2023',
            grade:        '90.33%',
            gradeType:    'percentage',
            gradeValue:   90.33,
        },
        {
            id:           'sslc',
            degree:       'Secondary Education (SSLC)',
            institution:  'Navanagar Rotary English Medium School',
            location:     'Karnataka',
            period:       '2021',
            grade:        '90.08%',
            gradeType:    'percentage',
            gradeValue:   90.08,
        },
    ],

    // ── Experience ────────────────────────────────────────────────────────────
    experience: [
        {
            id:          'robotics-lab',
            role:        'Robotics Lab Researcher',
            company:     'KLE Technological University',
            location:    'Hubballi',
            period:      '2024 – Present',
            type:        'academic',
            description: 'Designing and building autonomous robot prototypes. Working on ROS2-based navigation stacks and computer vision integration for mobile robotics.',
            highlights: [
                'Developed Person Following Robot using YOLOv8',
                'Built outdoor autonomous navigation framework for UGV',
                'Published research on real-time robot adaptability',
            ],
        },
    ],

    // ── Achievements ──────────────────────────────────────────────────────────
    achievements: [
        { id: 'cgpa', title: 'Academic Excellence', description: 'Maintaining CGPA of 9.27/10 in B.E. Automation & Robotics', year: 2024 },
        { id: 'research', title: 'Research Publication', description: 'Research on real-time adaptability of robots to dynamic production conditions', year: 2024 },
        { id: 'ugv', title: 'UGV Navigation Framework', description: 'Development and performance validation of outdoor autonomous navigation for UGV', year: 2024 },
    ],

    // ── Resume ────────────────────────────────────────────────────────────────
    resume: {
        filename: 'Shrigovinda Kulkarni Resume.pdf',
        path:     '/assets/Shrigovinda Kulkarni Resume.pdf',
    },
};

module.exports = PORTFOLIO_DATA;
