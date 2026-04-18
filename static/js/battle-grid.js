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
    canvas.style.backgroundColor = "#000000";
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    let width, height;
    let cols, rows;
    const gridSize = 60; // Size of each square
    let points = [];

    // Interaction variables
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };

    window.addEventListener("mousemove", (e) => {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.vx = mouse.x - lastMouse.x;
        mouse.vy = mouse.y - lastMouse.y;
    });

    let scrollY = window.scrollY;
    window.addEventListener("scroll", () => {
        let deltaY = window.scrollY - scrollY;
        scrollY = window.scrollY;
        // Simulate mouse movement interaction when scrolling
        if (mouse.x > 0 && mouse.y > 0) {
            mouse.vy += deltaY * 2.0; 
        }
    });

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        // Add padding to ensure grid covers the whole screen even when warped
        cols = Math.ceil(width / gridSize) + 2;
        rows = Math.ceil(height / gridSize) + 2;

        points = [];
        for (let i = 0; i < cols; i++) {
            points[i] = [];
            for (let j = 0; j < rows; j++) {
                // Initial positions slightly offset to center the grid
                const x = (i - 1) * gridSize + (width % gridSize) / 2;
                const y = (j - 1) * gridSize + (height % gridSize) / 2;
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

        // Physics update
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let p = points[i][j];

                // Mouse interaction distance
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                // Repel effect radius
                const effectRadius = 180;
                
                if (dist < effectRadius) {
                    let force = (effectRadius - dist) / effectRadius;
                    // Push away from mouse
                    p.vx -= (dx / dist) * force * 1.5;
                    p.vy -= (dy / dist) * force * 1.5;

                    // Drag along with mouse velocity
                    p.vx += mouse.vx * force * 0.08;
                    p.vy += mouse.vy * force * 0.08;
                }

                // Spring force back to original position
                p.vx += (p.ox - p.x) * 0.05;
                p.vy += (p.oy - p.y) * 0.05;

                // Friction/Damping
                p.vx *= 0.85;
                p.vy *= 0.85;

                // Apply velocity
                p.x += p.vx;
                p.y += p.vy;
            }
        }

        // Decay mouse velocity to prevent endless dragging after mouse stops
        mouse.vx *= 0.9;
        mouse.vy *= 0.9;

        // Draw grid
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Undertale Green: usually #00C000 or similar
        const colorMain = "rgba(0, 192, 0, 0.6)";
        const colorDiag = "rgba(0, 192, 0, 0.15)"; // Fainter color for triangulation

        // Draw diagonal lines (triangulation)
        ctx.beginPath();
        ctx.strokeStyle = colorDiag;
        ctx.lineWidth = 1;
        for (let i = 0; i < cols - 1; i++) {
            for (let j = 0; j < rows - 1; j++) {
                ctx.moveTo(points[i][j].x, points[i][j].y);
                ctx.lineTo(points[i+1][j+1].x, points[i+1][j+1].y);
            }
        }
        ctx.stroke();

        // Draw main square grid
        ctx.beginPath();
        ctx.strokeStyle = colorMain;
        ctx.lineWidth = 2;
        
        // Horizontal
        for (let j = 0; j < rows; j++) {
            ctx.moveTo(points[0][j].x, points[0][j].y);
            for (let i = 1; i < cols; i++) {
                ctx.lineTo(points[i][j].x, points[i][j].y);
            }
        }
        // Vertical
        for (let i = 0; i < cols; i++) {
            ctx.moveTo(points[i][0].x, points[i][0].y);
            for (let j = 1; j < rows; j++) {
                ctx.lineTo(points[i][j].x, points[i][j].y);
            }
        }
        ctx.stroke();

        requestAnimationFrame(update);
    }

    update();
});