// Firebase config is still loaded for Analytics (in firebase-config.js)
// Contact form submissions now go through the Contact Service API

import { initPreloader, initCursor, initPageEffects } from './effects.js';

let scene3d = null;
let currentSection = null;

// ─────────────────────────────────────────────
// Input Validation & Sanitization Helpers
// ─────────────────────────────────────────────
const FORM_LIMITS = { name: 100, email: 254, message: 2000 };
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const SUBMIT_COOLDOWN_MS = 60000; // 60 seconds between submissions

function sanitizeText(str) {
    // Strip HTML tags and encode special chars — prevents stored XSS via Firestore data
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .trim();
}

function validateForm(name, email, message) {
    const errors = [];
    if (!name || name.length < 2)          errors.push('Name must be at least 2 characters.');
    if (name.length > FORM_LIMITS.name)    errors.push(`Name must be under ${FORM_LIMITS.name} characters.`);
    if (!EMAIL_REGEX.test(email))          errors.push('Please enter a valid email address.');
    if (email.length > FORM_LIMITS.email)  errors.push('Email address is too long.');
    if (!message || message.length < 10)   errors.push('Message must be at least 10 characters.');
    if (message.length > FORM_LIMITS.message) errors.push(`Message must be under ${FORM_LIMITS.message} characters.`);
    return errors;
}

function isRateLimited() {
    const last = localStorage.getItem('_form_last_submit');
    if (last && Date.now() - parseInt(last, 10) < SUBMIT_COOLDOWN_MS) {
        const remaining = Math.ceil((SUBMIT_COOLDOWN_MS - (Date.now() - parseInt(last, 10))) / 1000);
        return `Please wait ${remaining}s before submitting again.`;
    }
    return null;
}

// Initialize Page-Specific Interactive Components
function initPage() {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Intersection Observer for Scroll Reveal
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger');
    revealElements.forEach(el => observer.observe(el));

    // Fallback: force-reveal elements already in the viewport on page load
    // (handles cases where observer misses elements already visible)
    requestAnimationFrame(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('active');
            }
        });
    });

    // 3. Form Submission — validated, sanitized, rate-limited
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // Add maxlength attributes to inputs for DOM-level enforcement
        const nameInput    = contactForm.querySelector('[name="name"]');
        const emailInput   = contactForm.querySelector('[name="email"]');
        const messageInput = contactForm.querySelector('[name="message"]');
        if (nameInput)    nameInput.setAttribute('maxlength', FORM_LIMITS.name);
        if (emailInput)   emailInput.setAttribute('maxlength', FORM_LIMITS.email);
        if (messageInput) messageInput.setAttribute('maxlength', FORM_LIMITS.message);

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;

            const name    = nameInput ? nameInput.value.trim() : '';
            const email   = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            // Client-side rate limiting
            const rateLimitMsg = isRateLimited();
            if (rateLimitMsg) {
                btn.innerHTML = rateLimitMsg;
                setTimeout(() => { btn.innerHTML = originalText; }, 3000);
                return;
            }

            // Validate inputs
            const errors = validateForm(name, email, message);
            if (errors.length > 0) {
                btn.innerHTML = errors[0]; // Show first error
                btn.style.background = '#ef4444';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 4000);
                return;
            }

            btn.innerHTML = 'Establishing Secure Connection...';
            btn.disabled = true;

            try {
                // POST to Contact Service via API Gateway
                const response = await fetch('/api/contact/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || `Server error: ${response.status}`);
                }

                // Record successful submission timestamp for rate limiting
                localStorage.setItem('_form_last_submit', Date.now().toString());

                btn.innerHTML = 'Transmission Successful ✓';
                btn.style.background = 'var(--accent)';
                contactForm.reset();

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 4000);
            } catch (error) {
                console.error('Form submission error:', error);
                btn.innerHTML = error.message || 'Transmission Failed. Try again.';
                btn.style.background = '#ef4444';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 4000);
            }
        });
    }

    // 4. 3D tilt, magnetic buttons, split headlines, counters, typewriter
    initPageEffects();
}

// ----------------------------------------------------
// Interactive Particle Canvas Background
// (fallback when the WebGL scene can't load)
// ----------------------------------------------------
function initBackgroundCanvas() {
    if (document.getElementById('bg-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let particles = [];
    const maxParticles = 60;
    const connectionDist = 120;
    let mouse = { x: null, y: null, active: false };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.35)' : 'rgba(244, 114, 182, 0.35)';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Connect to mouse
            if (mouse.active) {
                const mdx = p1.x - mouse.x;
                const mdy = p1.y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < 180) {
                    const malpha = (1 - mdist / 180) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(244, 114, 182, ${malpha})`;
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// ----------------------------------------------------
// Scroll Spy: highlight the nav link for the section in view
// and tell the 3D scene which section we're in
// ----------------------------------------------------
function initScrollSpy() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = [...document.querySelectorAll('main section[id]')];
    if (!sections.length) return;

    const update = () => {
        const line = window.innerHeight * 0.4;
        let active = sections[0];
        sections.forEach(sec => {
            if (sec.getBoundingClientRect().top <= line) active = sec;
        });
        if (active.id === currentSection) return;
        currentSection = active.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${currentSection}`));
        if (scene3d) scene3d.setSection(currentSection);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

// Global Setup (run once)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Page content
    initPage();

    // 2. Preloader + custom cursor + scroll spy
    initScrollSpy();
    initPreloader();
    initCursor();

    // 3. 3D WebGL scene (falls back to the 2D particle canvas if WebGL/CDN fails)
    import('./scene3d.js')
        .then(m => {
            scene3d = m.initScene3D();
            if (currentSection) scene3d.setSection(currentSection);
        })
        .catch(err => {
            console.warn('3D scene unavailable, using 2D fallback:', err);
            initBackgroundCanvas();
        });

    // Scroll Progress Bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // 4. Navbar Scroll Shadow Effect
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // 5. Mobile Toggle Navigation Trigger
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            mobileToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
            if (window.lucide) lucide.createIcons();
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
                if (window.lucide) lucide.createIcons();
            }
        });
    }

    // 6. Close the mobile menu after jumping to a section
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (!navLinks.classList.contains('active')) return;
            navLinks.classList.remove('active');
            mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
            if (window.lucide) lucide.createIcons();
        });
    });
});
