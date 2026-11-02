// ----------------------------------------------------
// UI Motion Effects
// Preloader, custom cursor, 3D tilt, magnetic buttons,
// split-text hero, typewriter, counters and stagger indexing.
// ----------------------------------------------------
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let typeTimer = null;

// ---------- Preloader (first hard load only) ----------
export function initPreloader() {
    const loader = document.getElementById('preloader');
    const done = () => document.body.classList.add('loaded');
    if (!loader) { done(); return; }

    const pct = loader.querySelector('.preloader-pct');
    const bar = loader.querySelector('.preloader-bar span');
    const start = performance.now();
    let progress = 0;
    let finished = false;

    const tick = () => {
        if (finished) return;
        // Ease towards 90% while assets load, then jump to 100% on window load
        progress += (90 - progress) * 0.04;
        if (pct) pct.textContent = `${Math.round(progress)}%`;
        if (bar) bar.style.width = `${progress}%`;
        requestAnimationFrame(tick);
    };
    tick();

    const finish = () => {
        if (finished) return;
        finished = true;
        if (pct) pct.textContent = '100%';
        if (bar) bar.style.width = '100%';
        const wait = Math.max(0, 900 - (performance.now() - start));
        setTimeout(() => {
            loader.classList.add('hide');
            done();
            setTimeout(() => loader.remove(), 900);
        }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);
    setTimeout(finish, 3500); // never block longer than this
}

// ---------- Custom cursor + click ripples ----------
export function initCursor() {
    if (isTouch) return;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    document.body.classList.add('has-cursor');

    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });

    const loop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('a, button, .mobile-toggle, input, textarea');
        const card = e.target.closest('.glass-slab, .project-img, .profile-frame');
        ring.classList.toggle('is-link', !!interactive);
        ring.classList.toggle('is-card', !interactive && !!card);
    });
    document.addEventListener('mouseleave', () => { ring.style.opacity = '0'; dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { ring.style.opacity = ''; dot.style.opacity = ''; });

    window.addEventListener('pointerdown', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
}

// ---------- 3D tilt with glare ----------
function initTilt() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.glass-slab, .project-img, .profile-frame').forEach(el => {
        if (el.dataset.tilt) return;
        el.dataset.tilt = '1';
        el.classList.add('tilt');
        const strength = el.classList.contains('profile-frame') ? 14 : 9;
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            el.style.setProperty('--rx', `${(0.5 - py) * strength}deg`);
            el.style.setProperty('--ry', `${(px - 0.5) * strength}deg`);
            el.style.setProperty('--mx', `${px * 100}%`);
            el.style.setProperty('--my', `${py * 100}%`);
            el.classList.add('is-tilting');
        });
        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--rx', '0deg');
            el.style.setProperty('--ry', '0deg');
            el.classList.remove('is-tilting');
        });
    });
}

// ---------- Magnetic buttons ----------
function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.btn-primary, .btn-premium, .btn-project, .logo').forEach(el => {
        if (el.dataset.magnetic) return;
        el.dataset.magnetic = '1';
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - (r.left + r.width / 2);
            const y = e.clientY - (r.top + r.height / 2);
            el.style.translate = `${x * 0.25}px ${y * 0.35}px`;
        });
        el.addEventListener('mouseleave', () => { el.style.translate = ''; });
    });
}

// ---------- Split headline into 3D-flipping letters ----------
function splitText() {
    const targets = document.querySelectorAll('main h1 .text-premium, main h1 .text-accent-gradient, main h1.text-premium');
    let index = 0;
    targets.forEach(el => {
        if (el.dataset.split) return;
        el.dataset.split = '1';
        el.classList.add('split');

        const walk = (node) => {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) {
                            frag.appendChild(document.createTextNode(part.replace(/ /g, ' ')));
                            return;
                        }
                        const word = document.createElement('span');
                        word.className = 'word';
                        [...part].forEach(ch => {
                            const c = document.createElement('span');
                            c.className = 'char';
                            c.textContent = ch;
                            c.style.setProperty('--ci', index++);
                            word.appendChild(c);
                        });
                        frag.appendChild(word);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
                    walk(child);
                }
            });
        };
        walk(el);
    });
    alignGradients();
}

// Each letter paints its own slice of the parent's gradient so the headline still reads as one sweep
function alignGradients() {
    document.querySelectorAll('.split').forEach(el => {
        el.style.setProperty('--bw', `${el.offsetWidth}px`);
        el.querySelectorAll('.char').forEach(c => {
            // offsetLeft ignores transforms, so this is stable mid-animation.
            // .split is position:relative; a .word may also act as offsetParent.
            let x = c.offsetLeft;
            const p = c.offsetParent;
            if (p && p !== el && el.contains(p)) x += p.offsetLeft;
            c.style.setProperty('--bx', `${-x}px`);
        });
    });
}
window.addEventListener('resize', () => requestAnimationFrame(alignGradients));

// ---------- Typewriter role rotator ----------
function initTypewriter() {
    clearTimeout(typeTimer);
    const el = document.querySelector('.typed[data-words]');
    if (!el) return;
    const words = el.dataset.words.split('|');
    let w = 0, i = 0, deleting = false;
    const step = () => {
        const word = words[w];
        i += deleting ? -1 : 1;
        el.textContent = word.slice(0, i);
        let delay = deleting ? 40 : 85;
        if (!deleting && i === word.length) { deleting = true; delay = 1600; }
        else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
        typeTimer = setTimeout(step, delay);
    };
    typeTimer = setTimeout(step, 1200);
}

// ---------- Count-up numbers ----------
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            const el = entry.target;
            const target = parseFloat(el.dataset.count);
            const decimals = (el.dataset.count.split('.')[1] || '').length;
            const suffix = el.dataset.suffix || '';
            const dur = 1800;
            const t0 = performance.now();
            const frame = (now) => {
                const p = Math.min((now - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 4);
                el.textContent = (target * eased).toFixed(decimals) + suffix;
                if (p < 1) requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        });
    }, { threshold: 0.4 });
    counters.forEach(el => io.observe(el));
}

// ---------- Stagger children in as they scroll into view ----------
// Each child is observed on its own; items arriving in the same batch get increasing delays.
function initStagger() {
    const io = new IntersectionObserver((entries) => {
        let order = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty('--i', order++);
            entry.target.classList.add('in');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const children = document.querySelectorAll('.reveal-stagger > *');
    children.forEach(child => io.observe(child));

    // Fallback: anything already on screen gets revealed even if the observer misses it
    const revealVisible = () => {
        let order = 0;
        children.forEach(child => {
            if (child.classList.contains('in')) return;
            const r = child.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                child.style.setProperty('--i', order++);
                child.classList.add('in');
                io.unobserve(child);
            }
        });
    };
    requestAnimationFrame(revealVisible);
    window.addEventListener('load', revealVisible, { once: true });
}

// ---------- Mouse parallax for depth layers ----------
let parallaxBound = false;
function initParallax() {
    if (isTouch || reduceMotion || parallaxBound) return;
    parallaxBound = true;
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        document.querySelectorAll('[data-depth]').forEach(el => {
            const d = parseFloat(el.dataset.depth);
            el.style.translate = `${x * d}px ${y * d}px`;
        });
    }, { passive: true });
}

export function initPageEffects() {
    initStagger();
    splitText();
    initTilt();
    initMagnetic();
    initTypewriter();
    initCounters();
    initParallax();
    if (document.fonts) document.fonts.ready.then(alignGradients);
}
