// ----------------------------------------------------
// 3D Background Scene (Three.js)
// A morphing "robot core" with orbit rings, floating geometry,
// a starfield and an infinite synth grid. Reacts to mouse,
// scroll, clicks and page changes.
// ----------------------------------------------------
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const COLORS = {
    bg: 0x050816,
    cyan: 0x22d3ee,
    violet: 0xa78bfa,
    pink: 0xf472b6,
    amber: 0xfbbf24,
};

// Per-page look: which shape the core morphs into, its tint, and where it sits.
// nx / ny are normalized screen coords (-1..1). `anchor` pins the core to a DOM element.
const PAGE_CONFIG = {
    'index.html':          { shape: 'ico',    color: COLORS.cyan,   glow: COLORS.violet, anchor: '.profile-frame', nx: 0.45, ny: 0.0,  scale: 1.0 },
    'about.html':          { shape: 'knot',   color: COLORS.violet, glow: COLORS.cyan,   nx: 0.72, ny: 0.35,  scale: 0.75 },
    'skills.html':         { shape: 'gear',   color: COLORS.amber,  glow: COLORS.pink,   nx: 0.74, ny: 0.45,  scale: 0.85 },
    'projects.html':       { shape: 'octa',   color: COLORS.pink,   glow: COLORS.cyan,   nx: 0.75, ny: 0.45,  scale: 0.8 },
    'certifications.html': { shape: 'dodeca', color: COLORS.violet, glow: COLORS.amber,  nx: 0.72, ny: 0.4,   scale: 0.8 },
    'contact.html':        { shape: 'torus',  color: COLORS.cyan,   glow: COLORS.pink,   nx: -0.7, ny: -0.45, scale: 0.8 },
};

function gearGeometry(teeth = 14, rOuter = 1.35, rInner = 1.08, hole = 0.4, depth = 0.38) {
    const shape = new THREE.Shape();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
        const a = i * step;
        const pts = [[rInner, a], [rOuter, a + step * 0.18], [rOuter, a + step * 0.45], [rInner, a + step * 0.63]];
        pts.forEach(([r, t], j) => {
            const x = Math.cos(t) * r;
            const y = Math.sin(t) * r;
            if (i === 0 && j === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        });
    }
    shape.closePath();
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, hole, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2, curveSegments: 24,
    });
    geo.center();
    return geo;
}

const SHAPES = {
    ico: () => new THREE.IcosahedronGeometry(1.4, 1),
    knot: () => new THREE.TorusKnotGeometry(0.95, 0.3, 140, 16, 2, 3),
    gear: () => gearGeometry(),
    octa: () => new THREE.OctahedronGeometry(1.5, 0),
    dodeca: () => new THREE.DodecahedronGeometry(1.4, 0),
    torus: () => new THREE.TorusGeometry(1.1, 0.42, 20, 60),
};

function glowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function pageKey(url) {
    const path = new URL(url, window.location.origin).pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
}

export function initScene3D() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduceMotion ? 0.25 : 1;

    const canvas = document.createElement('canvas');
    canvas.id = 'scene-3d';
    document.body.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(COLORS.bg, 0.045);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 9);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);
    const lightA = new THREE.PointLight(COLORS.cyan, 40, 30);
    const lightB = new THREE.PointLight(COLORS.pink, 40, 30);
    scene.add(lightA, lightB);

    const glowTex = glowTexture();

    // ---------- Core ----------
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const morphGroup = new THREE.Group(); // scaled during shape morphs
    coreGroup.add(morphGroup);

    const solidMat = new THREE.MeshStandardMaterial({
        color: 0x0b1024, metalness: 0.7, roughness: 0.25, flatShading: true,
        emissive: COLORS.violet, emissiveIntensity: 0.18, transparent: true, opacity: 0.92,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.9 });
    const dotMat = new THREE.PointsMaterial({
        color: 0xffffff, size: 0.12, map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });

    let solid = null;
    let edges = null;
    let dots = null;
    let currentShape = null;

    function buildShape(name) {
        [solid, edges, dots].forEach(o => {
            if (!o) return;
            morphGroup.remove(o);
            o.geometry.dispose();
        });
        const geo = SHAPES[name]();
        solid = new THREE.Mesh(geo, solidMat);
        const edgeGeo = new THREE.EdgesGeometry(geo, 18);
        edges = new THREE.LineSegments(edgeGeo, edgeMat);
        edges.scale.setScalar(1.002);
        morphGroup.add(solid, edges);
        if (edgeGeo.attributes.position.count < 600) {
            dots = new THREE.Points(edgeGeo.clone(), dotMat);
            morphGroup.add(dots);
        } else {
            dots = null;
        }
        currentShape = name;
    }

    // Halo glow behind the core
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: COLORS.violet, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    halo.scale.setScalar(7);
    coreGroup.add(halo);

    // Orbit rings with satellites
    const rings = [];
    const ringDefs = [
        { r: 2.2, color: COLORS.cyan, tilt: [1.2, 0.2, 0], speed: 0.6 },
        { r: 2.65, color: COLORS.violet, tilt: [1.75, -0.5, 0.4], speed: -0.45 },
        { r: 3.1, color: COLORS.pink, tilt: [0.5, 0.9, -0.3], speed: 0.32 },
    ];
    ringDefs.forEach((d, i) => {
        const pivot = new THREE.Group();
        pivot.rotation.set(...d.tilt);
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(d.r, 0.009, 8, 220),
            new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
        );
        pivot.add(ring);
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        const satGlow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTex, color: d.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        satGlow.scale.setScalar(0.9);
        sat.add(satGlow);
        pivot.add(sat);
        coreGroup.add(pivot);
        rings.push({ pivot, sat, def: d, phase: i * 2.1 });
    });

    // ---------- Floating geometry field ----------
    const field = new THREE.Group();
    scene.add(field);
    const fieldGeos = [
        new THREE.OctahedronGeometry(0.35, 0),
        new THREE.TetrahedronGeometry(0.4, 0),
        new THREE.BoxGeometry(0.45, 0.45, 0.45),
        new THREE.TorusGeometry(0.3, 0.1, 10, 28),
        new THREE.IcosahedronGeometry(0.32, 0),
    ];
    const fieldColors = [COLORS.cyan, COLORS.violet, COLORS.pink, COLORS.amber];
    const floaters = [];
    const floaterCount = isMobile ? 10 : 22;
    for (let i = 0; i < floaterCount; i++) {
        const geo = fieldGeos[i % fieldGeos.length];
        const color = fieldColors[i % fieldColors.length];
        const wire = i % 3 !== 0;
        const mat = wire
            ? new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.45 })
            : new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.3, flatShading: true, emissive: color, emissiveIntensity: 0.25 });
        const m = new THREE.Mesh(geo, mat);
        m.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 16, -2 - Math.random() * 12);
        m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
        const s = 0.6 + Math.random() * 1.2;
        m.scale.setScalar(s);
        field.add(m);
        floaters.push({ m, baseY: m.position.y, rs: (Math.random() - 0.5) * 0.8, phase: Math.random() * 6, amp: 0.2 + Math.random() * 0.5 });
    }

    // ---------- Starfield ----------
    const starCount = isMobile ? 900 : 2000;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const palette = [COLORS.cyan, COLORS.violet, COLORS.pink, 0xffffff, 0xffffff].map(c => new THREE.Color(c));
    for (let i = 0; i < starCount; i++) {
        const r = 18 + Math.random() * 45;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);
        const c = palette[i % palette.length];
        starCol[i * 3] = c.r; starCol[i * 3 + 1] = c.g; starCol[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        size: 0.22, map: glowTex, vertexColors: true, transparent: true, opacity: 0.9,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    }));
    scene.add(stars);

    // ---------- Infinite synth grid ----------
    const grid = new THREE.GridHelper(120, 120, COLORS.violet, COLORS.violet);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    // Additive so fogged (dark) far lines fade out instead of darkening the page
    grid.material.blending = THREE.AdditiveBlending;
    grid.material.depthWrite = false;
    grid.position.y = -5;
    scene.add(grid);

    // ---------- Interaction state ----------
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollY = window.scrollY;
    let pulse = 0;
    let config = PAGE_CONFIG[pageKey(location.href)] || PAGE_CONFIG['index.html'];
    const morph = { active: false, t: 0, next: null, swapped: false };
    const targetPos = new THREE.Vector3();
    let targetScale = config.scale;
    const tintColor = new THREE.Color(config.color);
    const glowColor = new THREE.Color(config.glow);

    buildShape(config.shape);

    window.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('pointerdown', () => { pulse = 1; }, { passive: true });

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // Work out where the core should be in world space (z = 0 plane)
    function computeTarget() {
        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        const halfW = halfH * camera.aspect;
        const narrow = window.innerWidth < 1025;
        const anchorEl = config.anchor && document.querySelector(config.anchor);
        if (anchorEl) {
            const r = anchorEl.getBoundingClientRect();
            const cx = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1;
            const cy = -(((r.top + r.height / 2) / window.innerHeight) * 2 - 1);
            targetPos.set(cx * halfW, cy * halfH, 0);
            // Size the orbit rings so they wrap around the element
            const worldPerPx = (halfH * 2) / window.innerHeight;
            targetScale = Math.max(0.6, (Math.max(r.height, r.width) * worldPerPx) / 2 / 2.1);
        } else if (narrow) {
            targetPos.set(halfW * 0.45, halfH * 0.55 + scrollY * 0.002, -2);
            targetScale = config.scale * 0.8;
        } else {
            targetPos.set(config.nx * halfW, config.ny * halfH + scrollY * 0.0015, 0);
            targetScale = config.scale;
        }
    }

    function setPage(url) {
        const next = PAGE_CONFIG[pageKey(url)] || PAGE_CONFIG['index.html'];
        config = next;
        tintColor.set(next.color);
        glowColor.set(next.glow);
        pulse = 1;
        if (next.shape !== currentShape) {
            morph.active = true;
            morph.t = 0;
            morph.next = next.shape;
            morph.swapped = false;
        }
    }

    const clock = new THREE.Clock();
    let firstFrame = true;

    function animate() {
        requestAnimationFrame(animate);
        if (document.hidden) return;

        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime * speed;

        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        computeTarget();
        if (firstFrame) {
            coreGroup.position.copy(targetPos);
            coreGroup.scale.setScalar(targetScale);
            firstFrame = false;
        }
        coreGroup.position.lerp(targetPos, 0.06);
        const s = THREE.MathUtils.lerp(coreGroup.scale.x, targetScale * (1 + pulse * 0.12), 0.08);
        coreGroup.scale.setScalar(s);
        pulse *= 0.93;

        // Shape morph: shrink + spin, swap geometry at midpoint, grow back
        let morphScale = 1;
        if (morph.active) {
            morph.t += dt / 0.9;
            if (morph.t >= 0.5 && !morph.swapped) {
                buildShape(morph.next);
                morph.swapped = true;
            }
            if (morph.t >= 1) morph.active = false;
            morphScale = Math.abs(Math.cos(Math.min(morph.t, 1) * Math.PI));
            morphGroup.rotation.y += dt * 9;
        }
        morphGroup.scale.setScalar(Math.max(morphScale, 0.001));

        const scrollSpin = scrollY * 0.0025;
        morphGroup.rotation.x = t * 0.25 + scrollSpin + mouse.y * 0.4;
        morphGroup.rotation.y += dt * 0.35 * speed;
        morphGroup.rotation.z = mouse.x * 0.3;

        // Breathing glow + colour easing
        edgeMat.color.lerp(tintColor, 0.05);
        solidMat.emissive.lerp(glowColor, 0.05);
        halo.material.color.lerp(glowColor, 0.05);
        halo.material.opacity = 0.28 + Math.sin(t * 1.6) * 0.07 + pulse * 0.3;
        dotMat.size = 0.12 + Math.sin(t * 3) * 0.03;

        rings.forEach(({ pivot, sat, def, phase }) => {
            const a = t * def.speed + phase;
            sat.position.set(Math.cos(a) * def.r, Math.sin(a) * def.r, 0);
            pivot.rotation.z += dt * 0.08 * Math.sign(def.speed) * speed;
        });

        // Lights circle the core
        lightA.position.set(coreGroup.position.x + Math.cos(t) * 5, coreGroup.position.y + Math.sin(t * 0.7) * 3, 4);
        lightB.position.set(coreGroup.position.x + Math.cos(t + Math.PI) * 5, coreGroup.position.y - Math.sin(t * 0.7) * 3, 3);

        floaters.forEach(f => {
            f.m.rotation.x += dt * f.rs * speed;
            f.m.rotation.y += dt * f.rs * 0.8 * speed;
            f.m.position.y = f.baseY + Math.sin(t + f.phase) * f.amp;
        });
        field.rotation.y = mouse.x * 0.12;
        field.rotation.x = -mouse.y * 0.06;
        field.position.y = scrollY * 0.004;

        stars.rotation.y = t * 0.015 + scrollY * 0.0002;
        stars.rotation.x = t * 0.006;

        grid.position.z = (t * 1.2) % 1;

        // Camera parallax + scroll tilt
        camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
        camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        camera.rotation.x -= Math.min(scrollY * 0.00015, 0.25);

        renderer.render(scene, camera);
    }
    animate();

    return { setPage, pulse: () => { pulse = 1; } };
}
