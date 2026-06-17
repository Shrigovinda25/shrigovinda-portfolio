import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let isTransitioning = false;

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
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
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
                // Store sanitized values — prevents stored XSS if data ever rendered as HTML
                await addDoc(collection(db, "messages"), {
                    name:      sanitizeText(name),
                    email:     sanitizeText(email),
                    message:   sanitizeText(message),
                    timestamp: serverTimestamp(),
                    userAgent: navigator.userAgent.substring(0, 200)
                });

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
                btn.innerHTML = 'Transmission Failed. Try again.';
                btn.style.background = '#ef4444';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 4000);
            }
        });
    }

    // 4. Interactive Tilt effect for cards
    const cards = document.querySelectorAll('.glass-slab');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });
}

// ----------------------------------------------------
// Interactive Particle Canvas Background
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
            this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.35)' : 'rgba(168, 85, 247, 0.35)';
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
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
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
                    ctx.strokeStyle = `rgba(168, 85, 247, ${malpha})`;
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
// PPT Page Transition Router
// ----------------------------------------------------
async function navigateTo(url, isPopState = false) {
    if (isTransitioning) return;
    isTransitioning = true;

    const mainEl = document.querySelector('main.container');
    if (!mainEl) {
        window.location.href = url;
        return;
    }

    // Phase 1: Slide Out Left
    mainEl.classList.add('page-exit');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main.container');
        const newTitle = doc.title;

        // Ensure slide transition finishes before swapping
        await new Promise(resolve => setTimeout(resolve, 450));

        if (newMain) {
            // Push history if not popstate
            if (!isPopState) {
                window.history.pushState(null, '', url);
            }
            document.title = newTitle;

            // Swap content and layout styling
            mainEl.innerHTML = newMain.innerHTML;
            mainEl.className = newMain.className;

            updateNavbarActive(url);

            // Collapse mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            const mobileToggle = document.querySelector('.mobile-toggle');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileToggle) {
                    const icon = mobileToggle.querySelector('i');
                    if (icon) {
                        icon.setAttribute('data-lucide', 'menu');
                        if (window.lucide) lucide.createIcons();
                    }
                }
            }

            // Scroll back to top
            window.scrollTo(0, 0);

            // Phase 2: Slide In Right
            mainEl.classList.remove('page-exit');
            mainEl.classList.add('page-enter');

            // Force reflow
            mainEl.offsetHeight;

            // Trigger enter animation
            mainEl.classList.remove('page-enter');

            // Re-initialize page scripts
            initPage();
        } else {
            window.location.href = url;
        }
    } catch (error) {
        console.error("Transition Navigation failed:", error);
        window.location.href = url;
    } finally {
        isTransitioning = false;
    }
}

function updateNavbarActive(url) {
    const navLinksList = document.querySelectorAll('.nav-links a');
    const pathname = new URL(url, window.location.origin).pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'index.html';

    navLinksList.forEach(link => {
        const linkPathname = new URL(link.href, window.location.origin).pathname;
        const linkFilename = linkPathname.substring(linkPathname.lastIndexOf('/') + 1) || 'index.html';
        
        if (linkFilename === filename) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Global Setup (run once)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Page content
    initPage();

    // 2. Initialize Canvas Background
    initBackgroundCanvas();

    // 3. Create Scroll Progress Bar
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '3px';
    progressBar.style.background = 'var(--gradient-1)';
    progressBar.style.zIndex = '1000';
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.1s ease-out';
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
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            if (window.lucide) lucide.createIcons();
        });
    }

    // 6. Click Interceptor for Transitions
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const isInternal = link.origin === window.location.origin;
        const isNotTargetBlank = link.target !== '_blank';
        const isNotDownload = !link.hasAttribute('download');
        const isStandardProtocol = ['http:', 'https:'].includes(link.protocol);
        const isNotBusDetails = !link.pathname.includes('HosurBusDetails.html');

        if (isInternal && isNotTargetBlank && isNotDownload && isStandardProtocol && isNotBusDetails) {
            e.preventDefault();
            navigateTo(link.href);
        }
    });

    // 7. Popstate Back/Forward Interceptor
    window.addEventListener('popstate', () => {
        navigateTo(window.location.href, true);
    });
});
