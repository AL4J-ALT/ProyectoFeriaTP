const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const maxSpeed = 40; // Velocidad mínima del intervalo

let snake = [{ x: 160, y: 160 }];
let direction = "right";
let food = spawnFood();
let score = 0;
let canChangeDirection = true;
let gameSpeed = 300;
let isPaused = false;

const scoreText = document.getElementById("score");
const speedText = document.getElementById("speed");
const pauseMenu = document.getElementById("pause-menu");
let timeLeft = 120;
const timerEl = document.getElementById("timer");
let timerInterval;

let game; // Variable para el intervalo principal del juego

document.addEventListener("keydown", changeDirection);

document.getElementById("btn-up").addEventListener("click", () => setDirection("up"));
document.getElementById("btn-left").addEventListener("click", () => setDirection("left"));
document.getElementById("btn-down").addEventListener("click", () => setDirection("down"));
document.getElementById("btn-right").addEventListener("click", () => setDirection("right"));
document.getElementById("btn-pause").addEventListener("click", togglePause);

function setDirection(newDirection) {
    if (isPaused) return;
    if (!canChangeDirection) return;
    const opposite = { "up": "down", "down": "up", "left": "right", "right": "left" };
    if (direction !== opposite[newDirection]) {
        direction = newDirection;
        canChangeDirection = false;
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        timerEl.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(game);
            alert("¡Se acabó el tiempo! Puntuación: " + score);
            location.reload();
        }
    }, 1000);
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(game);
        clearInterval(timerInterval);
        pauseMenu.style.display = 'flex';
    } else {
        // Si el menú de pausa estaba visible, lo ocultamos y reiniciamos el juego
        if (pauseMenu.style.display === 'flex') {
            pauseMenu.style.display = 'none';
        }
        game = setInterval(draw, gameSpeed);
        startTimer();
        pauseMenu.style.display = 'none';
    }
}

function changeDirection(event) {
    const key = event.key;

    if (key === " ") {
        event.preventDefault();
        togglePause();
        return;
    }

    if (isPaused || !canChangeDirection) return;

    if ((key === "ArrowLeft" || key.toLowerCase() === "a") && direction !== "right") {
        direction = "left";
    } else if ((key === "ArrowUp" || key.toLowerCase() === "w") && direction !== "down") {
        direction = "up";
    } else if ((key === "ArrowRight" || key.toLowerCase() === "d") && direction !== "left") {
        direction = "right";
    } else if ((key === "ArrowDown" || key.toLowerCase() === "s") && direction !== "up") {
        direction = "down";
    }
    canChangeDirection = false;
}

function collision(head, array) {
    return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function spawnFood() {
    const x = Math.floor(Math.random() * (canvas.width / box)) * box;
    const y = Math.floor(Math.random() * (canvas.height / box)) * box;
    return { x, y };
}

function dynamicSnakeSpeed() {
    if (gameSpeed <= maxSpeed) return;

    let newSpeed = gameSpeed;
    let emoji = '🐢';

    if (score >= 5 && score < 10) {
        newSpeed = 250;
        emoji = '🏃‍♂️';
    } else if (score >= 10 && score < 20) {
        newSpeed = 150;
        emoji = '🏃‍♂️';
    } else if (score >= 20 && score < 30) {
        newSpeed = 100;
        emoji = '🚘';
    } else if (score >= 30) {
        newSpeed = 60;
        emoji = '🚀';
    }

    if (newSpeed !== gameSpeed) {
        gameSpeed = newSpeed;
        speedText.textContent = `velocidad actual: ${emoji}`;
        clearInterval(game); // Detener el bucle actual
        game = setInterval(draw, gameSpeed); // Iniciar uno nuevo con la nueva velocidad
    }
}

function draw() {
    // Dibujar fondo
    ctx.fillStyle = "#1a252f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar serpiente
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#00ffcc" : "#00b38f";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Dibujar comida
    ctx.fillStyle = "#ff4757";
    ctx.fillRect(food.x, food.y, box, box);

    // Mover la serpiente
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "left") headX -= box;
    if (direction === "right") headX += box;
    if (direction === "up") headY -= box; // Corregido: 'up' debe restar en Y
    if (direction === "down") headY += box; // Corregido: 'down' debe sumar en Y

    // Comprobar colisiones
    if (headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height || collision({ x: headX, y: headY }, snake)) {
        clearInterval(game);
        clearInterval(timerInterval);
        alert(`¡Fin del juego! Has chocado. Puntuación: ${score}`);
        location.reload();
        return; // Detener la ejecución de la función
    }

    // Comprobar si come la comida
    if (headX === food.x && headY === food.y) {
        score++;
        food = spawnFood();
        scoreText.textContent = `${score} puntos`;
        dynamicSnakeSpeed();
    } else {
        snake.pop(); // Solo quitar la cola si no come
    }

    const newHead = { x: headX, y: headY };
    snake.unshift(newHead);

    canChangeDirection = true;
}

function startGame() {
    game = setInterval(draw, gameSpeed);
    startTimer();
}

startGame();
