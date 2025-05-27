let elixir = 5;
let maxElixir = 10;
let elixirInterval;
let timerInterval;
let time = 180;
let playerCrowns = 0;
let enemyCrowns = 0;
let towers = {};

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('gameUI').classList.remove('hidden');

    resetGame();
    startElixir();
    startTimer();
}

function restartGame() {
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('gameUI').classList.remove('hidden');

    resetGame();
    startElixir();
    startTimer();
}

function resetGame() {
    time = 180;
    playerCrowns = 0;
    enemyCrowns = 0;
    elixir = 5;
    updateElixirBar();
    updateTimer();
    updateScore();

    document.querySelectorAll('.troop').forEach(e => e.remove());

    towers = {
        enemyTower1: { hp: 100 },
        enemyTower2: { hp: 100 },
        enemyKingTower: { hp: 200 },
        allyTower1: { hp: 100 },
        allyTower2: { hp: 100 },
        allyKingTower: { hp: 200 }
    };

    updateTowers();
}

function updateTowers() {
    for (let id in towers) {
        let tower = document.getElementById(id);
        let hp = towers[id].hp;
        if (!tower.querySelector('.health-bar')) {
            let bar = document.createElement('div');
            bar.classList.add('health-bar');
            let inner = document.createElement('div');
            inner.classList.add('health-bar-inner');
            bar.appendChild(inner);
            tower.appendChild(bar);
        }
        const inner = tower.querySelector('.health-bar-inner');
        const maxHp = id.includes('King') ? 200 : 100;
        inner.style.width = (hp / maxHp) * 100 + '%';

        if (hp <= 0) {
            tower.style.display = 'none';
            if (id.includes('enemy')) playerCrowns++;
            if (id.includes('ally')) enemyCrowns++;
            updateScore();
            checkVictory();
        } else {
            tower.style.display = 'block';
        }
    }
}

function checkVictory() {
    if (towers.enemyKingTower.hp <= 0) {
        endGame('Você Venceu!');
    } else if (towers.allyKingTower.hp <= 0) {
        endGame('Você Perdeu!');
    }
}

function spawnTroop(type) {
    const costs = { giant: 5, archer: 3, miniPekka: 4 };
    const hpValues = { giant: 200, archer: 80, miniPekka: 120 };
    const speed = { giant: 1, archer: 1.5, miniPekka: 2 };
    const damage = { giant: 10, archer: 5, miniPekka: 15 };

    if (elixir < costs[type]) return;
    elixir -= costs[type];
    updateElixirBar();

    const troop = document.createElement('div');
    troop.classList.add('troop');
    troop.dataset.hp = hpValues[type];
    troop.dataset.type = type;
    troop.dataset.damage = damage[type];

    troop.style.left = '230px';
    troop.style.bottom = '100px';

    const healthBar = document.createElement('div');
    healthBar.classList.add('health-bar');
    const healthInner = document.createElement('div');
    healthInner.classList.add('health-bar-inner');
    healthBar.appendChild(healthInner);
    troop.appendChild(healthBar);

    document.getElementById('gameBoard').appendChild(troop);

    moveTroop(troop, speed[type]);

    document.getElementById('attackSound').currentTime = 0;
    document.getElementById('attackSound').play();
}

function moveTroop(troop, speed) {
    const interval = setInterval(() => {
        let bottom = parseFloat(troop.style.bottom);
        troop.style.bottom = (bottom + speed) + 'px';

        // Detecta torres inimigas
        const targets = ['enemyTower1', 'enemyTower2', 'enemyKingTower'].map(id => document.getElementById(id)).filter(e => e && e.style.display != 'none');

        let closest = targets[0];
        let minDist = 9999;
        targets.forEach(t => {
            const tRect = t.getBoundingClientRect();
            const troopRect = troop.getBoundingClientRect();
            const dist = Math.hypot(tRect.x - troopRect.x, tRect.y - troopRect.y);
            if (dist < minDist) {
                minDist = dist;
                closest = t;
            }
        });

        if (closest && minDist < 50) {
            attackTower(troop, closest.id);
            clearInterval(interval);
        }
    }, 50);
}

function attackTower(troop, towerId) {
    const dmg = parseFloat(troop.dataset.damage);
    const attack = setInterval(() => {
        if (!towers[towerId] || towers[towerId].hp <= 0) {
            clearInterval(attack);
            troop.remove();
            return;
        }
        towers[towerId].hp -= dmg;
        updateTowers();
    }, 500);
}

function startElixir() {
    clearInterval(elixirInterval);
    elixirInterval = setInterval(() => {
        if (elixir < maxElixir) {
            elixir += 0.2;
            updateElixirBar();
        }
    }, 200);
}

function updateElixirBar() {
    document.getElementById('elixirInner').style.width = `${(elixir / maxElixir) * 100}%`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (time > 0) {
            time--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            if (playerCrowns > enemyCrowns) {
                endGame('Você Venceu!');
            } else if (playerCrowns < enemyCrowns) {
                endGame('Você Perdeu!');
            } else {
                endGame('Empate!');
            }
        }
    }, 1000);
}

function updateTimer() {
    const m = String(Math.floor(time / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${m}:${s}`;
}

function updateScore() {
    document.getElementById('playerCrowns').innerText = playerCrowns;
    document.getElementById('enemyCrowns').innerText = enemyCrowns;
}

function endGame(message) {
    clearInterval(timerInterval);
    clearInterval(elixirInterval);

    document.getElementById('gameUI').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');

    document.getElementById('resultText').innerText = message;

    if (message.includes('Venceu')) {
        document.getElementById('winSound').play();
    } else if (message.includes('Perdeu')) {
        document.getElementById('loseSound').play();
    }
}
