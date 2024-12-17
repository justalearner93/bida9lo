const canvas = document.getElementById("billiardsCanvas");
const ctx = canvas.getContext("2d");

// Các biến chính
const balls = [];
const ballRadius = 10;
const holeRadius = 15;
const friction = 0.99;

// Lỗ bàn
const holes = [
    { x: 0, y: 0 },                              // Lỗ trên trái
    { x: canvas.width / 2, y: 0 },               // Lỗ trên giữa
    { x: canvas.width, y: 0 },                   // Lỗ trên phải
    { x: 0, y: canvas.height },                  // Lỗ dưới trái
    { x: canvas.width / 2, y: canvas.height },   // Lỗ dưới giữa
    { x: canvas.width, y: canvas.height },       // Lỗ dưới phải
];

// Bi trắng (Cue ball)
const cueBall = {
    x: 150,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    color: "white",
    type: "cue",
};

// Các bóng mục tiêu
const targetBalls = [
    { x: 400, y: 150, vx: 0, vy: 0, color: "red" },
    { x: 450, y: 200, vx: 0, vy: 0, color: "blue" },
    { x: 500, y: 250, vx: 0, vy: 0, color: "yellow" },
    { x: 400, y: 100, vx: 0, vy: 0, color: "brown" },
    { x: 600, y: 220, vx: 0, vy: 0, color: "pink" },
    { x: 700, y: 260, vx: 0, vy: 0, color: "black" }
];

// Thêm bóng vào danh sách
balls.push(cueBall, ...targetBalls);

let mouseX = 0, mouseY = 0;
let shooting = false;
let cuePower = 0;

// Vẽ bóng
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Vẽ lỗ
function drawHoles() {
    ctx.fillStyle = "black";
    holes.forEach(hole => {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

// Vẽ cây cơ
function drawCue() {
    const dx = mouseX - cueBall.x;
    const dy = mouseY - cueBall.y;
    const angle = Math.atan2(dy, dx);
    const cueLength = 50 + cuePower;

    ctx.beginPath();
    ctx.moveTo(cueBall.x, cueBall.y);
    ctx.lineTo(cueBall.x - cueLength * Math.cos(angle), cueBall.y - cueLength * Math.sin(angle));
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Cập nhật vị trí và xử lý va chạm
function updateBalls() {
    balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Va chạm với tường
        if (ball.x + ballRadius > canvas.width || ball.x - ballRadius < 0) ball.vx = -ball.vx;
        if (ball.y + ballRadius > canvas.height || ball.y - ballRadius < 0) ball.vy = -ball.vy;

        // Ma sát
        ball.vx *= friction;
        ball.vy *= friction;
    });

    handleCollisions();
    checkHoles();
}

// Xử lý va chạm giữa các bóng
function handleCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ball1 = balls[i];
            const ball2 = balls[j];
            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ballRadius * 2) {
                // Đổi hướng
                const angle = Math.atan2(dy, dx);
                [ball1.vx, ball2.vx] = [ball2.vx, ball1.vx];
                [ball1.vy, ball2.vy] = [ball2.vy, ball1.vy];
            }
        }
    }
}

// Kiểm tra lỗ
function checkHoles() {
    balls.forEach((ball, index) => {
        holes.forEach(hole => {
            const dx = hole.x - ball.x;
            const dy = hole.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < holeRadius) {
                if (ball.type === "cue") {
                    // Đặt lại bi trắng nếu rơi vào lỗ
                    ball.x = 150;
                    ball.y = canvas.height / 2;
                    ball.vx = 0;
                    ball.vy = 0;
                } else {
                    // Xóa bóng khỏi bàn
                    balls.splice(index, 1);
                }
            }
        });
    });
}

// Xử lý chuột
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => {
    shooting = true;
    cuePower = 0;
});

canvas.addEventListener("mouseup", () => {
    shooting = false;

    const dx = mouseX - cueBall.x;
    const dy = mouseY - cueBall.y;
    const angle = Math.atan2(dy, dx);

    cueBall.vx = -cuePower * Math.cos(angle);
    cueBall.vy = -cuePower * Math.sin(angle);
    cuePower = 0;
});

// Vòng lặp game
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ bàn và các thành phần
    drawHoles();
    balls.forEach(drawBall);

    // Vẽ cây cơ
    if (shooting) {
        cuePower = Math.min(cuePower + 1, 30);
        drawCue();
    }

    updateBalls();

    requestAnimationFrame(gameLoop);
}

// Bắt đầu game
gameLoop();