document.addEventListener('DOMContentLoaded', () => {
    const keys = {};
    const redTank = document.getElementById('red');
    const blueTank = document.getElementById('blue');
    const backButton = document.getElementById('backButton');
    const floor = document.getElementById('floor');
    const redScoreDisplay = document.getElementById('redScore');
    const blueScoreDisplay = document.getElementById('blueScore');
    
    // Constants
    const gravity = 0.5;
    const maxShots = 5;
    const cooldownTime = 2000;
    const winningPoints = 5; // Score needed to win
    const floorY = floor.offsetTop;

    // Initial positions and states
    const initialRedPosition = { x: 50, y: 50 };
    const initialBluePosition = { x: window.innerWidth - 150, y: 50 };

    const redPlayer = { ...initialRedPosition, speed: 7, health: 5, velocityY: 0, shotsFired: 0, canShoot: true, points: 0 };
    const bluePlayer = { ...initialBluePosition, speed: 7, health: 5, velocityY: 0, shotsFired: 0, canShoot: true, points: 0 };
    const balls = [];
    let gameActive = true;

    // Setting tank positions
    redTank.style.position = 'absolute';
    blueTank.style.position = 'absolute';

    // Back button functionality
    backButton.style.display = 'none';
    backButton.addEventListener('click', () => {
        location.reload(); // Go back to the main page or restart the game
    });

    // Track key presses for movement
    window.addEventListener('keydown', (event) => {
        if (!gameActive) return;
        keys[event.key] = true;

        if ((event.key === 'f' || event.key === 'F') && redPlayer.canShoot) {
            shootBall(redPlayer, 'red');
            redPlayer.shotsFired++;
            checkShootingCooldown(redPlayer);
        }

        if (event.key === '/' && bluePlayer.canShoot) {
            shootBall(bluePlayer, 'blue');
            bluePlayer.shotsFired++;
            checkShootingCooldown(bluePlayer);
        }
    });

    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    // Update player positions
    function updatePlayerPosition() {
        if (keys['w']) redPlayer.y -= redPlayer.speed;
        if (keys['s']) redPlayer.y += redPlayer.speed;
        if (keys['a']) redPlayer.x -= redPlayer.speed;
        if (keys['d']) redPlayer.x += redPlayer.speed;

        if (keys['ArrowUp']) bluePlayer.y -= bluePlayer.speed;
        if (keys['ArrowDown']) bluePlayer.y += bluePlayer.speed;
        if (keys['ArrowLeft']) bluePlayer.x -= bluePlayer.speed;
        if (keys['ArrowRight']) bluePlayer.x += bluePlayer.speed;

        applyGravity(redPlayer, redTank);
        applyGravity(bluePlayer, blueTank);

        const canvasWidth = window.innerWidth;
        redPlayer.x = Math.max(0, Math.min(canvasWidth - redTank.width, redPlayer.x));
        bluePlayer.x = Math.max(0, Math.min(canvasWidth - blueTank.width, bluePlayer.x));

        redTank.style.left = `${redPlayer.x}px`;
        redTank.style.top = `${redPlayer.y}px`;
        blueTank.style.left = `${bluePlayer.x}px`;
        blueTank.style.top = `${bluePlayer.y}px`;
    }

    // Apply gravity
    function applyGravity(player, tankElement) {
        if (player.y + tankElement.height < floorY) {
            player.velocityY += gravity;
        } else {
            player.velocityY = 0;
            player.y = floorY - tankElement.height;
        }
        player.y += player.velocityY;
    }

    // Shooting function
    function shootBall(player, color) {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.style.position = 'absolute';
        ball.style.width = '10px';
        ball.style.height = '10px';
        ball.style.borderRadius = '50%';
        ball.style.backgroundColor = color;
        ball.style.left = `${player.x + 20}px`;
        ball.style.top = `${player.y + 20}px`;
        ball.directionX = color === 'red' ? 5 : -5;
        ball.owner = color;

        document.body.appendChild(ball);
        balls.push(ball);
    }

    function checkShootingCooldown(player) {
        if (player.shotsFired >= maxShots) {
            player.canShoot = false;
            setTimeout(() => {
                player.shotsFired = 0;
                player.canShoot = true;
            }, cooldownTime);
        }
    }

    function respawnTank(player, tankElement, initialPosition) {
        setTimeout(() => {
            if (player.points < winningPoints) {
                player.x = initialPosition.x;
                player.y = initialPosition.y;
                player.health = 5;
                document.body.appendChild(tankElement);
            }
        }, 2000);
    }

    function updateScoreDisplay() {
        redScoreDisplay.textContent = `Red Tank: ${redPlayer.points}`;
        blueScoreDisplay.textContent = `Blue Tank: ${bluePlayer.points}`;
    }

    function checkWinCondition() {
        if (redPlayer.points >= winningPoints) {
            alert("Red Tank Wins!");
            gameActive = false;
            backButton.style.display = 'block';
        } else if (bluePlayer.points >= winningPoints) {
            alert("Blue Tank Wins!");
            gameActive = false;
            backButton.style.display = 'block';
        }
    }

    function updateBalls() {
        for (let i = balls.length - 1; i >= 0; i--) {
            const ball = balls[i];
            ball.style.left = `${parseInt(ball.style.left) + ball.directionX}px`;

            if (ball.owner !== 'red' && checkCollision(ball, redPlayer, redTank)) {
                redPlayer.health--;
                ball.remove();
                balls.splice(i, 1);
                if (redPlayer.health <= 0) {
                    redTank.remove();
                    bluePlayer.points++;
                    updateScoreDisplay();
                    checkWinCondition();
                    if (gameActive) respawnTank(redPlayer, redTank, initialRedPosition);
                }
            } else if (ball.owner !== 'blue' && checkCollision(ball, bluePlayer, blueTank)) {
                bluePlayer.health--;
                ball.remove();
                balls.splice(i, 1);
                if (bluePlayer.health <= 0) {
                    blueTank.remove();
                    redPlayer.points++;
                    updateScoreDisplay();
                    checkWinCondition();
                    if (gameActive) respawnTank(bluePlayer, blueTank, initialBluePosition);
                }
            }
        }
    }

    function checkCollision(ball, player, tankElement) {
        const ballRect = ball.getBoundingClientRect();
        const tankRect = tankElement.getBoundingClientRect();
        return ballRect.left < tankRect.right && ballRect.right > tankRect.left &&
            ballRect.top < tankRect.bottom && ballRect.bottom > tankRect.top;
    }

    // Main game loop
    function gameLoop() {
        if (gameActive) {
            updatePlayerPosition();
            updateBalls();
            requestAnimationFrame(gameLoop);
        }
    }

    updateScoreDisplay();
    gameLoop();
});
