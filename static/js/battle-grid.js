document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.id = "battle-grid";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";
    canvas.style.backgroundColor = "#000000"; // Black background prevents browser default white
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    let width, height;
    let cols, rows;
    const gridSize = 60; // Size of each square
    let points = [];

    // Interaction variables
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };
    let isBackgroundClick = false;

    window.addEventListener("mousemove", (e) => {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.vx = mouse.x - lastMouse.x;
        mouse.vy = mouse.y - lastMouse.y;
    });

    window.addEventListener("mousedown", (e) => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'html' || tag === 'body' || e.target.classList.contains('wrap') || e.target.classList.contains('container') || e.target.id === 'battle-grid') {
            isBackgroundClick = true;
        }
    });

    window.addEventListener("mouseup", () => {
        isBackgroundClick = false;
    });

    window.addEventListener("touchstart", (e) => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'html' || tag === 'body' || e.target.classList.contains('wrap') || e.target.classList.contains('container') || e.target.id === 'battle-grid') {
            isBackgroundClick = true;
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, {passive: true});

    window.addEventListener("touchend", () => {
        isBackgroundClick = false;
    });

    window.addEventListener("touchmove", (e) => {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.vx = mouse.x - lastMouse.x;
        mouse.vy = mouse.y - lastMouse.y;
    }, {passive: true});

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        cols = Math.ceil(width / gridSize) + 2;
        rows = Math.ceil(height / gridSize) + 3;

        points = [];
        for (let i = 0; i < cols; i++) {
            points[i] = [];
            for (let j = 0; j < rows; j++) {
                const x = (i - 1) * gridSize + (width % gridSize) / 2;
                const y = (j - 2) * gridSize + (height % gridSize) / 2;
                points[i][j] = {
                    x: x, y: y,
                    ox: x, oy: y, // Original coords
                    vx: 0, vy: 0, // Vertex velocities
                    
                    // Pluck physics for horizontal edge from this point to i+1
                    phx: 0, phy: 0, phvx: 0, phvy: 0,
                    // Pluck physics for vertical edge from this point to j+1
                    pvx: 0, pvy: 0, pvvx: 0, pvvy: 0
                };
            }
        }
    }

    window.addEventListener("resize", init);
    init();

    function update() {
        ctx.clearRect(0, 0, width, height);

        const scrollSpeed = 0.5;
        const pluckRadius = 80;
        const impulseStrength = 0.12;
        const pluckSpring = 0.08;
        const pluckDamping = 0.94;
        const mouseXParallax = 8; // max px of global X offset

        // Global X parallax: grid shifts slightly toward mouse
        const centerX = width / 2;
        const globalXOffset = mouse.x > -500 ? ((mouse.x - centerX) / centerX) * mouseXParallax : 0;

        // Physics update
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let p = points[i][j];

                // 1. Vertex Physics (Scrolling & Stretching)
                p.oy += scrollSpeed;
                p.y += scrollSpeed;

                if (p.oy > height + gridSize) {
                    p.oy -= rows * gridSize;
                    p.y -= rows * gridSize;
                    p.vx = 0; p.vy = 0;
                }

                if (isBackgroundClick) {
                    let dx = mouse.x - p.x;
                    let dy = mouse.y - p.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    const stretchRadius = 400;
                    if (dist < stretchRadius) {
                        let force = (stretchRadius - dist) / stretchRadius;
                        p.vx += (dx / dist) * force * 3.5;
                        p.vy += (dy / dist) * force * 3.5;
                    }
                }

                // Spring toward rest position + global X parallax offset
                p.vx += (p.ox + globalXOffset - p.x) * 0.08;
                p.vy += (p.oy - p.y) * 0.08;
                p.vx *= 0.82;
                p.vy *= 0.82;
                p.x += p.vx;
                p.y += p.vy;

                // 2. Edge Pluck Physics (Horizontal) — velocity-impulse based
                if (i < cols - 1) {
                    let p2 = points[i+1][j];
                    if (Math.abs(p.oy - p2.oy) < gridSize * 2) {
                        let mx = (p.x + p2.x) / 2;
                        let my = (p.y + p2.y) / 2;
                        let dx = mouse.x - mx;
                        let dy = mouse.y - my;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (!isBackgroundClick && dist < pluckRadius) {
                            let proximity = (1 - dist / pluckRadius);
                            proximity *= proximity; // quadratic falloff for natural feel
                            p.phvx += mouse.vx * proximity * impulseStrength;
                            p.phvy += mouse.vy * proximity * impulseStrength;
                        }
                        p.phvx += (0 - p.phx) * pluckSpring;
                        p.phvy += (0 - p.phy) * pluckSpring;
                        p.phvx *= pluckDamping;
                        p.phvy *= pluckDamping;
                        p.phx += p.phvx;
                        p.phy += p.phvy;
                    } else {
                        p.phx = p.phy = p.phvx = p.phvy = 0;
                    }
                }

                // 3. Edge Pluck Physics (Vertical) — velocity-impulse based
                if (j < rows - 1) {
                    let p2 = points[i][j+1];
                    if (Math.abs(p.oy - p2.oy) < gridSize * 2) {
                        let mx = (p.x + p2.x) / 2;
                        let my = (p.y + p2.y) / 2;
                        let dx = mouse.x - mx;
                        let dy = mouse.y - my;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (!isBackgroundClick && dist < pluckRadius) {
                            let proximity = (1 - dist / pluckRadius);
                            proximity *= proximity;
                            p.pvvx += mouse.vx * proximity * impulseStrength;
                            p.pvvy += mouse.vy * proximity * impulseStrength;
                        }
                        p.pvvx += (0 - p.pvx) * pluckSpring;
                        p.pvvy += (0 - p.pvy) * pluckSpring;
                        p.pvvx *= pluckDamping;
                        p.pvvy *= pluckDamping;
                        p.pvx += p.pvvx;
                        p.pvy += p.pvvy;
                    } else {
                        p.pvx = p.pvy = p.pvvx = p.pvvy = 0;
                    }
                }
            }
        }

        mouse.vx *= 0.8;
        mouse.vy *= 0.8;

        // Draw grid
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(0, 192, 0, 0.25)";
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        // Draw Horizontal Edges
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols - 1; i++) {
                let p1 = points[i][j];
                let p2 = points[i+1][j];
                if (Math.abs(p1.oy - p2.oy) < gridSize * 2) {
                    ctx.moveTo(p1.x, p1.y);
                    if (Math.abs(p1.phx) > 0.5 || Math.abs(p1.phy) > 0.5) {
                        // Control point displacement needs to be 2x for quadraticCurve to pass through midpoint
                        let cx = (p1.x + p2.x)/2 + p1.phx * 2;
                        let cy = (p1.y + p2.y)/2 + p1.phy * 2;
                        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
                    } else {
                        ctx.lineTo(p2.x, p2.y);
                    }
                }
            }
        }
        // Draw Vertical Edges
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows - 1; j++) {
                let p1 = points[i][j];
                let p2 = points[i][j+1];
                if (Math.abs(p1.oy - p2.oy) < gridSize * 2) {
                    ctx.moveTo(p1.x, p1.y);
                    if (Math.abs(p1.pvx) > 0.5 || Math.abs(p1.pvy) > 0.5) {
                        let cx = (p1.x + p2.x)/2 + p1.pvx * 2;
                        let cy = (p1.y + p2.y)/2 + p1.pvy * 2;
                        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
                    } else {
                        ctx.lineTo(p2.x, p2.y);
                    }
                }
            }
        }
        ctx.stroke();

        requestAnimationFrame(update);
    }

    update();
});