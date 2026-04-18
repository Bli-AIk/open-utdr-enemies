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
    canvas.style.backgroundColor = "transparent"; // Canvas should be transparent
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
        // Check if the click is on the background (body, html, or main container)
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'html' || tag === 'body' || e.target.classList.contains('wrap') || e.target.classList.contains('container')) {
            isBackgroundClick = true;
        }
    });

    window.addEventListener("mouseup", () => {
        isBackgroundClick = false;
    });

    // Touch support for mobile
    window.addEventListener("touchstart", (e) => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'html' || tag === 'body' || e.target.classList.contains('wrap') || e.target.classList.contains('container')) {
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

    let scrollY = window.scrollY;
    window.addEventListener("scroll", () => {
        let deltaY = window.scrollY - scrollY;
        scrollY = window.scrollY;
        // Simulate mouse movement interaction when scrolling
        if (mouse.x > 0 && mouse.y > 0) {
            mouse.vy += deltaY * 1.5; 
        }
    });

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        // Add padding to ensure grid covers the whole screen even when warped or scrolling
        cols = Math.ceil(width / gridSize) + 2;
        rows = Math.ceil(height / gridSize) + 3;

        points = [];
        for (let i = 0; i < cols; i++) {
            points[i] = [];
            for (let j = 0; j < rows; j++) {
                // Initial positions slightly offset to center the grid
                const x = (i - 1) * gridSize + (width % gridSize) / 2;
                const y = (j - 2) * gridSize + (height % gridSize) / 2;
                points[i][j] = {
                    x: x,
                    y: y,
                    ox: x, // Original X
                    oy: y, // Original Y
                    vx: 0,
                    vy: 0
                };
            }
        }
    }

    window.addEventListener("resize", init);
    init();

    function update() {
        ctx.clearRect(0, 0, width, height);

        // Grid scroll speed
        const scrollSpeed = 0.5;

        // Physics update
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let p = points[i][j];

                // Continuous downward scroll
                p.oy += scrollSpeed;
                p.y += scrollSpeed;

                // Wrap around when it goes off screen at the bottom
                if (p.oy > height + gridSize) {
                    p.oy -= rows * gridSize;
                    p.y -= rows * gridSize;
                    p.vx = 0;
                    p.vy = 0;
                }

                // Mouse interaction distance
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                // Repel effect radius based on interaction type
                const effectRadius = isBackgroundClick ? 350 : 60;
                
                if (dist < effectRadius) {
                    let force = (effectRadius - dist) / effectRadius;
                    
                    if (isBackgroundClick) {
                        // "Stretching" - Pull strongly towards mouse when clicking background
                        p.vx += (dx / dist) * force * 2.5;
                        p.vy += (dy / dist) * force * 2.5;
                    } else {
                        // "Plucking" - Sharp repel when just moving over lines
                        p.vx -= (dx / dist) * force * 5.0;
                        p.vy -= (dy / dist) * force * 5.0;
                    }
                }

                // Spring force back to original position
                p.vx += (p.ox - p.x) * 0.08;
                p.vy += (p.oy - p.y) * 0.08;

                // Friction/Damping (high damping for string-like snap back)
                p.vx *= 0.82;
                p.vy *= 0.82;

                // Apply velocity
                p.x += p.vx;
                p.y += p.vy;
            }
        }

        // Decay mouse velocity
        mouse.vx *= 0.8;
        mouse.vy *= 0.8;

        // Draw grid
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Undertale Green, lowered opacity
        ctx.strokeStyle = "rgba(0, 192, 0, 0.25)";
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        // Horizontal lines
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols - 1; i++) {
                let p1 = points[i][j];
                let p2 = points[i+1][j];
                // Don't draw line if points have wrapped around to opposite ends
                if (Math.abs(p1.oy - p2.oy) < gridSize * 2) {
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }
        }
        // Vertical lines
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows - 1; j++) {
                let p1 = points[i][j];
                let p2 = points[i][j+1];
                // Don't draw line if points have wrapped around to opposite ends
                if (Math.abs(p1.oy - p2.oy) < gridSize * 2) {
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }
        }
        ctx.stroke();

        requestAnimationFrame(update);
    }

    update();
});