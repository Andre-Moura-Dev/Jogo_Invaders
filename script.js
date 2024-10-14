document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    //Altura e Largura do jogo
    canvas.width = 480;
    canvas.height = 600;

    // Configurações do jogo
    const shipWidth = 60;
    const shipHeight = 20;
    const shipSpeed = 5;
    const bulletSpeed = 7;
    const invaderWidth = 40;
    const invaderHeight = 20;
    let invaderSpeed = 1; //Verifica se o Jogo é inicilizado corretamente
    const rowsOfInvaders = 3;
    const colsOfInvaders = 5;
    const invaders = [];
    const invaderTypes = [
        { width: 40, height: 20, color: 'white', points: 10 },
        { width: 40, height: 20, color: 'red', points: 20 },
        { width: 40, height: 20, color: 'green', points: 30 },
        { width: 40, height: 20, color: 'blue', points: 40 },
        { width: 40, height: 20, color: 'orange', points: 50}
    ];

    let shipX = canvas.width / 2 - shipWidth / 2;
    let shipY = canvas.height - shipHeight - 10;
    let bullets = [];
    let invaderDirection = 1;
    let score = 0;
    let level = 1;
    let invaderCount = 0;
    let gameOver = false;

    let specialPowerActive = false;
    let powerCooldown = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && shipX > 0) {
            shipX -= shipSpeed;
        }
        if (e.key === 'ArrowRight' && shipX < canvas.width - shipWidth) {
            shipX += shipSpeed;
        }
        if (e.key === ' ' && !gameOver && powerCooldown <= 0) {
            if (specialPowerActive) {
                bullets.push({ x: shipX + shipWidth / 2 - 15, y: shipY, type: 'spread' });
                bullets.push({ x: shipX + shipWidth / 2 - 5, y: shipY, type: 'spread' });
                bullets.push({ x: shipX + shipWidth / 2 + 5, y: shipY, type: 'spread' });
                bullets.push({ x: shipX + shipWidth / 2 + 15, y: shipY, type: 'spread' });
            } else {
                bullets.push({ x: shipX + shipWidth / 2 - 2.5, y: shipY });
            }
        }
        
        if(e.key == 'p' || e.key == 'P') {
            specialPowerActive = !specialPowerActive;
        }
    });

    function drawShip() {
        ctx.fillStyle = 'white';
        ctx.fillRect(shipX, shipY, shipWidth, shipHeight);
    }

    function drawBullets() {
        bullets.forEach(bullet => {
            ctx.fillStyle = bullet.type === 'spread' ? 'yellow' : 'white';
            ctx.fillRect(bullet.x, bullet.y, 5, 10);
        });
    }

    function drawInvaders() {
        invaders.forEach(invader => {
            ctx.fillStyle = invader.color;
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        });
    }

    function drawScoreAndLevel() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, 10, 20);
        ctx.fillText('Level: ' + level, canvas.width - 100, 20);
    }

    function updateBullets() {
        bullets.forEach(bullet => {
            bullet.y -= bulletSpeed;
        });
        bullets = bullets.filter(bullet => bullet.y > 0);
    }

    const invaderBullets = [];
    const invaderBulletSpeed = 3;
    const invaderShootInterval = 50;
    let invaderShootTimer = 0;

    function drawInvadersBullets() {
        ctx.fillStyle = 'red';
        invaderBullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 10, 20);
        });
    }

    function updateInvadersBullets() {
        invaderBullets.forEach(bullet => {
            bullet.y += invaderBulletSpeed;
        });
    }

    function updateInvaders() {
        let edgeHit = false;
        invaders.forEach(invader => {
            invader.x += invaderSpeed * invaderDirection;
            if (invader.x <= 0 || invader.x >= canvas.width - invader.width) {
                edgeHit = true;
            }
        });

        if (edgeHit) {
            invaderDirection *= -1;
            invaders.forEach(invader => {
                invader.y += 20;
            });
        }
        invaderShootTimer++;
        
        if (invaderShootTimer >= invaderShootInterval) {
            invaders.forEach(invader => {
                if (Math.random() < 0.02) {
                    invaderBullets.push({
                        x: invader.x + invader.width / 2 - 2.5,
                        y: invader.y + invader.height,
                    });
                }
            });
            invaderShootTimer = 0;
        }
    }

    function checkCollisions() {
        bullets.forEach(bullet => {
            invaders.forEach((invader, index) => {
                if (bullet.x < invader.x + invader.width &&
                    bullet.x + 5 > invader.x &&
                    bullet.y < invader.y + invader.height &&
                    bullet.y + 10 > invader.y) {
                    score += invader.points;
                    invaders.splice(index, 1);
                    bullets = bullets.filter(b => b !== bullet);
                    invaderCount--;
                }
            });
        });

        invaderBullets.forEach(bullet => {
            if (bullet.x < shipX + shipWidth &&
                bullet.x + 5 > shipX &&
                bullet.y < shipY + shipHeight &&
                bullet.y + 10 > shipY) {
                gameOver = true;
            }
        });

        invaders.forEach(invader => {
            if (invader.y + invader.height >= shipY) {
                if (invader.x < shipX + shipWidth &&
                    invader.x + invader.width > shipX) {
                    gameOver = true;
                }
            }
        });
    }

    function initializeInvaders() {
        invaders.length = 0;
        invaderCount = 0;

        for (let row = 0; row < rowsOfInvaders; row++) {
            for (let col = 0; col < colsOfInvaders; col++) {
                let type = invaderTypes[Math.floor(Math.random() * invaderTypes.length)];
                invaders.push({
                    x: 50 + col * (invaderWidth + 10),
                    y: 50 + row * (invaderHeight + 10),
                    width: type.width,
                    height: type.height,
                    color: type.color,
                    points: type.points
                });
                invaderCount++;
            }
        }
    }

    function update() {
        if (gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'red';
            ctx.font = '40px Arial, sans-serif';
            ctx.fillText('GAME OVER!', canvas.width / 2 - 100, canvas.height / 2);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShip();
        drawBullets();
        drawInvaders();
        drawInvadersBullets();
        drawScoreAndLevel();
        updateBullets();
        updateInvadersBullets();
        updateInvaders();
        checkCollisions();

        if (invaderCount === 0) {
            level++;
            invaderSpeed += 0.5;
            initializeInvaders();
        }

        requestAnimationFrame(update);
    }

    // Iniciar o jogo
    initializeInvaders();
    update();
});