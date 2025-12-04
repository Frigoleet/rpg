// Ability scores state
const abilityScores = {
    health: 0,
    attackPower: 0,
    spellPower: 0,
    deceit: 0,
    defence: 0,
    magicResist: 0,
    intuition: 0
};

// Portrait library (relative paths)
const portraitLibrary = {
    Human: {
        Male: [
            'Media/Portraits/Human/Male/Human_Male_1_Standard.png'
        ],
        Female: [
            'Media/Portraits/Human/Female/Human_Female_1_Standard.png'
        ]
    },
    Elf: {
        Male: ['Media/Portraits/Elf/Male/Ranger_male_1_Standard.png'],
        Female: ['Media/Portraits/Elf/Female/Ranger_female_1_Standard.png']
    },
    Dwarf: {
        Male: ['Media/Portraits/Dwarf/Male/Dwarf_Male_1_Standard.png'],
        Female: ['Media/Portraits/Dwarf/Female/Dwarf_Female_1_Standard.png']
    },
    Fairy: {
        Male: ['Media/Portraits/Fairy/Male/Fairy_Male_1_Standard.png'],
        Female: ['Media/Portraits/Fairy/Female/Fairy_Female_1_Standard.png']
    }
};

// NPC portrait pools
const npcPortraits = {
    Goblin: [
        'Media/Portraits/NPC/Goblin/Goblin_male_1.png'
    ]
};

// Base ability scores for generated/loaded NPCs (neutral average)
const npcBaseAbilityScores = {
    health: 10,
    attackPower: 10,
    spellPower: 10,
    deceit: 10,
    defence: 10,
    magicResist: 10,
    intuition: 10
};

// Battle state
const battleState = {
    player: null,
    playerCharacter: null,
    enemies: [],
    started: false,
    turnType: null, // 'player' or 'enemy'
    enemyTurnIndex: 0,
    log: []
};

// Static list of NPC files to spawn from local folder (relative to index.html)
const npcSpawnFiles = [
    'Character%20save%20files/NPC/Tamsin_Farwatch_NPC.json'
];

// Static list of player character files to auto-load in battle (relative to index.html)
const playerLoadFiles = [
    'Character save files/Player/Frigoleet_Character.json'
];

let pointsRemaining = 20;
let currentStep = 1;
const totalSteps = 5;

// GM session state
const gmSession = {
    storyLog: []
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Character === 'undefined') {
        alert('Character module failed to load. Please refresh the page.');
        return;
    }
    initializeAbilityScores();
    setupExport();
    setupNavigation();
    setupSelectionButtons();
    setupSummary();
    setupPageNavigation();
    setupBattle();
    setupGMConsole();
    updateStepDisplay();
    updateSummary();
});

// Page navigation setup
function setupPageNavigation() {
    const startPage = document.getElementById('startPage');
    const creationPage = document.getElementById('creationPage');
    const visualizationPage = document.getElementById('visualizationPage');
    const battlePage = document.getElementById('battlePage');
    
    const createNewBtn = document.getElementById('createNewBtn');
    const generateNpcBtn = document.getElementById('generateNpcBtn');
    const gmConsoleBtn = document.getElementById('gmConsoleBtn');
    const battleRulesBtn = document.getElementById('battleRulesBtn');
    const battleArenaBtn = document.getElementById('battleArenaBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    const backToStartBtn = document.getElementById('backToStartBtn');
    const rulesBackBtn = document.getElementById('rulesBackBtn');
    const battleBackBtn = document.getElementById('battleBackBtn');
    const battleResetBtn = document.getElementById('battleResetBtn');
    const exportCharBtn = document.getElementById('exportCharBtn');
    const playerBattleInput = document.getElementById('playerBattleInput');
    const npcBattleInput = document.getElementById('npcBattleInput');
    const gmBackBtn = document.getElementById('gmBackBtn');
    const gmExportBtn = document.getElementById('gmExportBtn');
    const gmImportBtn = document.getElementById('gmImportBtn');
    const sessionImportInput = document.getElementById('sessionImportInput');
    
    // Show creation page
    createNewBtn.addEventListener('click', () => {
        showPage('creationPage');
    });
    
    if (battleArenaBtn) {
        battleArenaBtn.addEventListener('click', () => {
            showPage('battlePage');
            resetBattle();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (battleBackBtn) {
        battleBackBtn.addEventListener('click', () => {
            showPage('startPage');
        });
    }
    
    if (battleResetBtn) {
        battleResetBtn.addEventListener('click', () => {
            resetBattle();
        });
    }
    
    // Show battle rules
    if (battleRulesBtn) {
        battleRulesBtn.addEventListener('click', () => {
            showPage('rulesPage');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (rulesBackBtn) {
        rulesBackBtn.addEventListener('click', () => {
            showPage('startPage');
        });
    }
    
    // Generate NPC save file
    if (generateNpcBtn) {
        generateNpcBtn.addEventListener('click', () => {
            const npc = generateRandomNPC();
            downloadNPC(npc);
        });
    }

    // GM console navigation
    if (gmConsoleBtn) {
        gmConsoleBtn.addEventListener('click', () => {
            showPage('gmPage');
            renderGMStoryLog();
        });
    }
    if (gmBackBtn) {
        gmBackBtn.addEventListener('click', () => {
            showPage('startPage');
        });
    }
    if (gmExportBtn) {
        gmExportBtn.addEventListener('click', () => exportGMSession());
    }
    if (gmImportBtn && sessionImportInput) {
        gmImportBtn.addEventListener('click', () => sessionImportInput.click());
        sessionImportInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) importGMSession(file);
        });
    }
    
    // Exit creation flow back to main menu
    backToMainBtn.addEventListener('click', () => {
        showPage('startPage');
        currentStep = 1;
        updateStepDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Back to start
    backToStartBtn.addEventListener('click', () => {
        showPage('startPage');
    });
    
    // Export from visualization page
    exportCharBtn.addEventListener('click', () => {
        if (currentCharacter) {
            exportCharacter();
        }
    });
}

// Show specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

// Setup battle UI and handlers
function setupBattle() {
    const playerUploadBtn = document.getElementById('playerUploadBtn');
    const playerUploadPicker = document.getElementById('playerUploadPicker');
    const npcUploadBtn = document.getElementById('npcUploadBtn');
    const spawnNpcBtn = document.getElementById('spawnNpcBtn');
    const playerBattleInput = document.getElementById('playerBattleInput');
    const npcBattleInput = document.getElementById('npcBattleInput');
    const startBattleBtn = document.getElementById('startBattleBtn');
    const attackBtn = document.getElementById('attackBtn');
    const exportBattleCharBtn = document.getElementById('exportBattleCharBtn');
    
    if (playerUploadBtn) {
        playerUploadBtn.addEventListener('click', () => {
            loadBattleCharacterFromFolder();
        });
    }
    if (playerUploadPicker && playerBattleInput) {
        playerUploadPicker.addEventListener('click', () => playerBattleInput.click());
    }
    if (playerBattleInput) {
        playerBattleInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                loadBattleCharacter(file);
            }
        });
    }
    
    if (npcUploadBtn && npcBattleInput) {
        npcUploadBtn.addEventListener('click', () => npcBattleInput.click());
        npcBattleInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                loadBattleNPC(file);
            }
        });
    }
    
    if (spawnNpcBtn) {
        spawnNpcBtn.addEventListener('click', async () => {
            await spawnRandomNPCFromFolder();
        });
    }
    
    if (startBattleBtn) {
        startBattleBtn.addEventListener('click', () => {
            if (battleState.player && battleState.enemies.length > 0) {
                startBattle();
            }
        });
    }
    
    if (attackBtn) {
        attackBtn.addEventListener('click', () => {
            handleBattleAction();
        });
    }
    if (exportBattleCharBtn) {
        exportBattleCharBtn.addEventListener('click', () => {
            if (battleState.player) {
                currentCharacter = restoreCharacterFromCombatant(battleState.player);
                exportCharacter();
            }
        });
    }
    
    renderBattleUI();
}

function resetBattle() {
    battleState.player = null;
    battleState.playerCharacter = null;
    battleState.enemies = [];
    battleState.started = false;
    battleState.turnType = null;
    battleState.enemyTurnIndex = 0;
    battleState.log = [];
    renderBattleUI();
}

// Load player character file for battle
function loadBattleCharacter(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target.result);
            const character = Character.fromJSON(json);
            battleState.playerCharacter = character;
            battleState.player = buildCombatantFromCharacter(character, 'player');
            battleState.started = false;
            battleState.turn = null;
            appendBattleLog(`Loaded character: ${battleState.player.name}`);
        } catch (error) {
            alert('Could not load character file for battle. Please ensure it is a valid character JSON.');
            console.error(error);
        } finally {
            renderBattleUI();
        }
    };
    reader.readAsText(file);
    const playerBattleInput = document.getElementById('playerBattleInput');
    if (playerBattleInput) {
        playerBattleInput.value = '';
    }
}

// Load player character from pre-defined folder (uses first available file)
async function loadBattleCharacterFromFolder() {
    if (!playerLoadFiles.length) {
        alert('No player character files configured.');
        return;
    }
    const path = playerLoadFiles[0];
    try {
        const urlsToTry = [path, encodeURI(path)];
        let json = null;
        let lastError = null;
        for (const url of urlsToTry) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                json = await response.json();
                break;
            } catch (err) {
                lastError = err;
            }
        }
        if (!json) {
            throw lastError || new Error('Failed to load player file');
        }
        const character = Character.fromJSON(json);
        battleState.playerCharacter = character;
        battleState.player = buildCombatantFromCharacter(character, 'player');
        battleState.started = false;
        battleState.turn = null;
        appendBattleLog(`Loaded character: ${battleState.player.name} (from folder)`);
    } catch (err) {
        alert('Could not load character file from folder. If running from file://, start a local server or use manual upload.');
        appendBattleLog(`<span class="enemy-text">Load failed</span> ${err.message || err}`);
        console.error(err);
        // Fallback: trigger manual picker so user can choose the file directly
        const picker = document.getElementById('playerBattleInput');
        if (picker) picker.click();
    } finally {
        renderBattleUI();
    }
}

// Load NPC file for battle (either NPC json or character json)
function loadBattleNPC(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target.result);
            if (json.abilityScores) {
                const character = Character.fromJSON(json);
                battleState.enemies.push(buildCombatantFromCharacter(character, 'npc'));
            } else {
                battleState.enemies.push(buildCombatantFromNPCData(json));
            }
            battleState.started = false;
            battleState.turnType = null;
            appendBattleLog(`Loaded NPC: ${battleState.enemies[battleState.enemies.length - 1].name}`);
        } catch (error) {
            alert('Could not load NPC file for battle. Please ensure it is a valid NPC JSON.');
            console.error(error);
        } finally {
            renderBattleUI();
        }
    };
    reader.readAsText(file);
    const npcBattleInput = document.getElementById('npcBattleInput');
    if (npcBattleInput) {
        npcBattleInput.value = '';
    }
}

function buildCombatantFromCharacter(character, type = 'player') {
    const level = character.level || 1;
    const healthScore = character.abilityScores.health ?? 8;
    const attackMod = character.getAbilityModifier('attackPower');
    const defenceMod = character.getAbilityModifier('defence');
    const maxHp = Math.max(1, (healthScore * 2) + level);
    const attackBonus = 2 + attackMod;
    const damageBonus = attackMod;
    const defense = 10 + defenceMod;
    
    return {
        id: character.id || `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: character.name || (type === 'player' ? 'Player Character' : 'NPC'),
        race: character.race || 'Unknown',
        className: character.class || 'Unknown',
        level,
        maxHp,
        currentHp: maxHp,
        attackBonus,
        damageDice: '1d8',
        damageBonus,
        defense,
        type,
        experience: character.experience || 0,
        originalCharacter: character,
        portrait: character.portrait || null
    };
}

function buildCombatantFromNPCData(npcData) {
    const level = npcData.level || 1;
    const maxHp = npcData.hitpoints || Math.max(8, 10 + (level * 2));
    const attackBonus = npcData.attackBonus !== undefined ? npcData.attackBonus : 2 + Math.floor(level / 2);
    const parsedDamage = parseDamageExpression(npcData.damage);
    const damageDice = parsedDamage.expression || '1d6';
    const damageBonus = parsedDamage.bonus !== null ? parsedDamage.bonus : Math.floor(level / 2);
    const defense = npcData.defense || 10;
    const experienceYield = npcData.experienceYield || Math.max(10, level * 25);
    
    return {
        id: npcData.id || `npc_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: npcData.name || 'NPC Opponent',
        race: npcData.race || 'Unknown',
        className: npcData.class || 'Unknown',
        level,
        maxHp,
        currentHp: maxHp,
        attackBonus,
        damageDice,
        damageBonus,
        defense,
        experienceYield,
        type: 'npc',
        portrait: npcData.portrait || null
    };
}

async function spawnRandomNPCFromFolder() {
    // Instead of fetching from disk (which browsers block on file://), create a fresh NPC in-memory
    const npcData = generateRandomNPC();
    // Attach a random goblin portrait if available
    const goblinPortraits = npcPortraits.Goblin || [];
    if (goblinPortraits.length) {
        npcData.portrait = goblinPortraits[Math.floor(Math.random() * goblinPortraits.length)];
    }
    battleState.enemies.push(buildCombatantFromNPCData(npcData));
    battleState.started = false;
    battleState.turnType = null;
    appendBattleLog(`Spawned NPC: ${battleState.enemies[battleState.enemies.length - 1].name}`);
    renderBattleUI();
}

function parseDamageExpression(expr) {
    if (!expr || typeof expr !== 'string') {
        return { expression: null, bonus: null };
    }
    const match = expr.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!match) {
        return { expression: null, bonus: null };
    }
    return {
        expression: `${match[1]}d${match[2]}`,
        bonus: match[3] ? parseInt(match[3], 10) : null
    };
}

function startBattle() {
    if (!battleState.player || battleState.enemies.length === 0) {
        return;
    }
    battleState.started = true;
    battleState.turnType = 'player';
    battleState.enemyTurnIndex = 0;
    battleState.player.currentHp = battleState.player.maxHp;
    battleState.enemies.forEach(enemy => {
        enemy.currentHp = enemy.maxHp;
    });
    battleState.log = [];
    appendBattleLog('Battle started! Player goes first.');
    renderBattleUI();
}

function handleBattleAction() {
    if (!battleState.started || !battleState.turnType) return;
    if (battleState.turnType !== 'enemy') return;

    advanceEnemyTurn();
    renderBattleUI();
}

function handlePlayerAttack(targetId) {
    if (!battleState.started || battleState.turnType !== 'player') return;
    const enemy = battleState.enemies.find(e => e.id === targetId && e.currentHp > 0);
    if (!enemy) return;
    performAttack(battleState.player, enemy);
    renderBattleUI();
    if (enemy.currentHp <= 0) {
        appendBattleLog(`<span class="tag">Enemy Down!</span> ${enemy.name} is defeated.`);
        if (enemy.experienceYield && battleState.player) {
            addExperienceToPlayer(enemy.experienceYield);
            appendBattleLog(`<span class="tag">XP</span> Gained ${enemy.experienceYield} XP.`);
        }
        if (battleState.enemies.every(e => e.currentHp <= 0)) {
            appendBattleLog(`<span class="tag">Victory</span> All enemies defeated.`);
            battleState.started = false;
            battleState.turnType = null;
            renderBattleUI();
            return;
        }
    }
    battleState.turnType = 'enemy';
    battleState.enemyTurnIndex = 0;
    renderBattleUI();
}

function advanceEnemyTurn() {
    const aliveEnemies = battleState.enemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) {
        appendBattleLog(`<span class="tag">Victory</span> All enemies defeated.`);
        battleState.started = false;
        battleState.turnType = null;
        return;
    }
    // find next alive enemy based on enemyTurnIndex
    while (battleState.enemyTurnIndex < battleState.enemies.length && battleState.enemies[battleState.enemyTurnIndex].currentHp <= 0) {
        battleState.enemyTurnIndex++;
    }
    if (battleState.enemyTurnIndex >= battleState.enemies.length) {
        // end of enemy phase
        battleState.turnType = 'player';
        battleState.enemyTurnIndex = 0;
        return;
    }
    const attacker = battleState.enemies[battleState.enemyTurnIndex];
    performAttack(attacker, battleState.player);
    if (battleState.player.currentHp <= 0) {
        appendBattleLog(`<span class="enemy-text">Defeat</span> ${battleState.player.name} falls.`);
        battleState.turnType = null;
        battleState.started = false;
        return;
    }
    battleState.enemyTurnIndex++;
    // if still enemies remain this enemy phase, stay on enemy turn, else back to player
    if (battleState.enemyTurnIndex >= battleState.enemies.length || battleState.enemies.every(e => e.currentHp <= 0)) {
        battleState.turnType = 'player';
        battleState.enemyTurnIndex = 0;
    }
}

function performAttack(attacker, defender) {
    const attackRoll = rollDie(20);
    const attackTotal = attackRoll + attacker.attackBonus;
    const isCrit = attackRoll === 20;
    const hit = isCrit || attackTotal >= defender.defense;
    let damage = 0;
    
    if (hit) {
        const baseDamage = rollDamage(attacker.damageDice) + (typeof attacker.damageBonus === 'number' ? attacker.damageBonus : 0);
        damage = isCrit ? baseDamage * 2 : baseDamage;
        defender.currentHp = Math.max(0, defender.currentHp - damage);
    }
    
    const attackerTag = attacker.type === 'npc' ? '<span class="enemy-text">NPC</span>' : '<span class="tag">Player</span>';
    const hitText = hit ? `hits for ${damage} damage${isCrit ? ' (CRIT)' : ''}` : 'misses';
    appendBattleLog(`${attackerTag} ${attacker.name} rolls ${attackTotal} (d20:${attackRoll}) vs Defense ${defender.defense} and ${hitText}.`);
}

function rollDamage(expr) {
    const match = expr ? expr.match(/(\d+)d(\d+)([+-]\d+)?/i) : null;
    if (!match) return 1;
    const dice = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const mod = match[3] ? parseInt(match[3], 10) : 0;
    let total = 0;
    for (let i = 0; i < dice; i++) {
        total += rollDie(sides);
    }
    return total + mod;
}

function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function renderBattleUI() {
    const player = battleState.player;
    const startBattleBtn = document.getElementById('startBattleBtn');
    const attackBtn = document.getElementById('attackBtn');
    const turnText = document.getElementById('battleTurn');
    const exportBattleCharBtn = document.getElementById('exportBattleCharBtn');
    
    renderCombatant('player', player);
    renderEnemies();
    updateBattleLogUI();
    
    if (startBattleBtn) {
        startBattleBtn.disabled = !(player && battleState.enemies.length > 0) || battleState.started;
    }
    if (attackBtn) {
        attackBtn.disabled = !battleState.started || battleState.turnType !== 'enemy';
        attackBtn.textContent = 'Resolve Enemy Turn';
    }
    if (exportBattleCharBtn) {
        const battleOver = battleState.player && (!battleState.started || battleState.turnType === null);
        exportBattleCharBtn.disabled = !battleOver;
    }
    
    if (turnText) {
        if (!player || battleState.enemies.length === 0) turnText.textContent = 'Awaiting uploads...';
        else if (!battleState.started && player.currentHp <= 0) turnText.textContent = 'Defeat.';
        else if (!battleState.started && battleState.enemies.every(e => e.currentHp <= 0)) turnText.textContent = 'Victory achieved.';
        else if (!battleState.started) turnText.textContent = 'Ready to start battle.';
        else if (battleState.turnType === 'player') turnText.textContent = 'Your turn: choose a target.';
        else turnText.textContent = 'Enemy turn...';
    }

    renderPlayerTargets();
}

function renderCombatant(side, combatant) {
    const nameEl = document.getElementById(`${side}Name`);
    const metaEl = document.getElementById(`${side}Meta`);
    const portraitEl = document.getElementById(`${side}Portrait`);
    const hpTextEl = document.getElementById(`${side}HpText`);
    const hpFillEl = document.getElementById(`${side}HpFill`);
    const statsEl = document.getElementById(`${side}Stats`);
    
    if (!nameEl || !metaEl || !hpTextEl || !hpFillEl || !statsEl) return;
    
    if (!combatant) {
        nameEl.textContent = side === 'player' ? 'No character loaded' : 'No NPC loaded';
        metaEl.textContent = '--';
        if (portraitEl) portraitEl.innerHTML = '';
        hpTextEl.textContent = 'HP: --';
        hpFillEl.style.width = '0%';
        statsEl.innerHTML = '';
        return;
    }
    
    nameEl.textContent = combatant.name;
    metaEl.textContent = `${combatant.race} ${combatant.className} • Level ${combatant.level}`;
    if (portraitEl) {
        portraitEl.innerHTML = combatant.portrait ? `<img src="${combatant.portrait}" alt="${combatant.name} portrait">` : '';
    }
    hpTextEl.textContent = `HP: ${combatant.currentHp}/${combatant.maxHp}`;
    const hpPercent = Math.max(0, Math.min(100, (combatant.currentHp / combatant.maxHp) * 100));
    hpFillEl.style.width = `${hpPercent}%`;
    
    const bonusText = combatant.damageBonus
        ? combatant.damageBonus > 0
            ? `+${combatant.damageBonus}`
            : `${combatant.damageBonus}`
        : '';
    const statsHtml = [
        `<span class="stat-chip">Attack +${combatant.attackBonus}</span>`,
        `<span class="stat-chip">Defense ${combatant.defense}</span>`,
        `<span class="stat-chip">Damage ${combatant.damageDice}${bonusText}</span>`
    ].join('');
    statsEl.innerHTML = statsHtml;
}

function renderEnemies() {
    const list = document.getElementById('enemyList');
    if (!list) return;
    if (!battleState.enemies.length) {
        list.innerHTML = '<div class="combatant-card"><div class="combatant-header"><div class="combatant-role enemy">Enemy</div><div class="combatant-name">No NPC loaded</div></div><div class="hp-text">HP: --</div></div>';
        return;
    }
    list.innerHTML = battleState.enemies.map(enemy => {
        const hpPercent = enemy.maxHp ? Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100)) : 0;
        return `
        <div class="combatant-card">
            <div class="combatant-header">
                <div class="combatant-role enemy">Enemy</div>
                <div class="combatant-name">${enemy.name}</div>
                <div class="combatant-meta">${enemy.race || 'Unknown'} ${enemy.className || ''} • Level ${enemy.level}</div>
            </div>
            ${enemy.portrait ? `<div class="combatant-portrait"><img src="${enemy.portrait}" alt="${enemy.name} portrait"></div>` : ''}
            <div class="hp-bar enemy">
                <div class="hp-fill enemy" style="width:${hpPercent}%"></div>
            </div>
            <div class="hp-text">HP: ${enemy.currentHp}/${enemy.maxHp}</div>
            <div class="combatant-stats">
                <span class="stat-chip">Attack +${enemy.attackBonus}</span>
                <span class="stat-chip">Defense ${enemy.defense}</span>
                <span class="stat-chip">Damage ${enemy.damageDice}${enemy.damageBonus ? `+${enemy.damageBonus}` : ''}</span>
            </div>
        </div>`;
    }).join('');
}

function renderPlayerTargets() {
    const container = document.getElementById('playerAttackButtons');
    if (!container) return;
    if (!battleState.started || battleState.turnType !== 'player') {
        container.innerHTML = '';
        return;
    }
    const alive = battleState.enemies.filter(e => e.currentHp > 0);
    if (!alive.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = alive.map(enemy => {
        return `<button class="player-target-btn" data-target="${enemy.id}">Attack ${enemy.name}</button>`;
    }).join('');
    container.querySelectorAll('.player-target-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handlePlayerAttack(btn.dataset.target);
        });
    });
}

function addExperienceToPlayer(amount) {
    if (!battleState.player || amount <= 0) return;
    // Prefer updating the original Character if available
    if (battleState.playerCharacter) {
        battleState.playerCharacter.addExperience(amount);
        battleState.player.experience = battleState.playerCharacter.experience;
        battleState.player.level = battleState.playerCharacter.level;
    } else {
        battleState.player.experience = (battleState.player.experience || 0) + amount;
        battleState.player.level = Character.getLevelFromExperience(battleState.player.experience);
    }
}

function appendBattleLog(message) {
    battleState.log.unshift(message);
    if (battleState.log.length > 30) {
        battleState.log.pop();
    }
    updateBattleLogUI();
}

function updateBattleLogUI() {
    const logEl = document.getElementById('battleLog');
    if (!logEl) return;
    if (!battleState.log.length) {
        logEl.innerHTML = '<div class="empty-message">No battle events yet.</div>';
        return;
    }
    logEl.innerHTML = battleState.log.map(entry => `<div class="battle-log-entry">${entry}</div>`).join('');
}

// --- GM Console ---
function setupGMConsole() {
    const promptInput = document.getElementById('gmPromptInput');
    const sendBtn = document.getElementById('gmSendBtn');
    const chips = document.querySelectorAll('#gmChips .chip-btn');

    if (chips && chips.length) {
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                if (promptInput) {
                    promptInput.value = chip.dataset.prompt || '';
                }
            });
        });
    }

    if (sendBtn && promptInput) {
        sendBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (!prompt) return;
            addGMStoryEntry('Player', prompt);
            // Stubbed AI response
            const response = `[GM Stub] I will handle this once the AI API is wired. You asked: "${prompt}"`;
            addGMStoryEntry('GM', response);
            promptInput.value = '';
            renderGMStoryLog();
        });
    }

    renderGMStoryLog();
}

function addGMStoryEntry(author, text) {
    gmSession.storyLog.unshift({
        author,
        text,
        date: new Date().toISOString()
    });
    if (gmSession.storyLog.length > 50) gmSession.storyLog.pop();
}

function renderGMStoryLog() {
    const logEl = document.getElementById('gmStoryLog');
    if (!logEl) return;
    if (!gmSession.storyLog.length) {
        logEl.innerHTML = '<div class="empty-message">No story entries yet.</div>';
        return;
    }
    logEl.innerHTML = gmSession.storyLog.map(entry => {
        const ts = new Date(entry.date).toLocaleString();
        return `
            <div class="story-entry">
                <div class="story-meta">${entry.author} • ${ts}</div>
                <div class="story-text">${entry.text}</div>
            </div>
        `;
    }).join('');
}

function exportGMSession() {
    const data = JSON.stringify(gmSession, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gm_session.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importGMSession(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target.result);
            gmSession.storyLog = Array.isArray(json.storyLog) ? json.storyLog : [];
            renderGMStoryLog();
        } catch (err) {
            alert('Could not import GM session file.');
            console.error(err);
        } finally {
            const input = document.getElementById('sessionImportInput');
            if (input) input.value = '';
        }
    };
    reader.readAsText(file);
}

function restoreCharacterFromCombatant(combatant) {
    if (!combatant) return null;
    // If we have the original Character with full data, use it
    if (combatant.originalCharacter instanceof Character) {
        combatant.originalCharacter.experience = combatant.experience || combatant.originalCharacter.experience;
        combatant.originalCharacter.updateLevel();
        return combatant.originalCharacter;
    }
    // Fallback: rebuild a minimal Character from combat data
    return new Character({
        id: combatant.id,
        name: combatant.name,
        race: combatant.race,
        className: combatant.className,
        abilityScores: { ...npcBaseAbilityScores },
        experience: combatant.experience || 0,
        missionLog: []
    });
}

// Initialize ability score controls
function initializeAbilityScores() {
    const abilities = ["health", "attackPower", "spellPower", "deceit", "defence", "magicResist", "intuition"];
    
    abilities.forEach(ability => {
        const plusBtn = document.querySelector(`.btn-plus[data-ability="${ability}"]`);
        const minusBtn = document.querySelector(`.btn-minus[data-ability="${ability}"]`);
        const input = document.getElementById(ability);
        
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adjustAbilityScore(ability, 1);
        }, { passive: false });
        
        plusBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            adjustAbilityScore(ability, 1);
        }, { passive: false });
        
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adjustAbilityScore(ability, -1);
        }, { passive: false });
        
        minusBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            adjustAbilityScore(ability, -1);
        }, { passive: false });
        
        updateAbilityScoreDisplay(ability);
    });
    
    updatePointsRemaining();
}

// Adjust ability score
function adjustAbilityScore(ability, change) {
    const currentValue = abilityScores[ability];
    const newValue = currentValue + change;
    
    // Check constraints
    if (newValue < 0 || newValue > 15) {
        return;
    }
    
    // Equal cost: 1 point per increment
    if (change > 0 && pointsRemaining <= 0) {
        return;
    }
    
    abilityScores[ability] = newValue;
    pointsRemaining -= change;
    
    updateAbilityScoreDisplay(ability);
    updatePointsRemaining();
    updateSummary();
}

// Update ability score display
function updateAbilityScoreDisplay(ability) {
    const input = document.getElementById(ability);
    const value = abilityScores[ability];
    input.value = value;
    
    const plusBtn = document.querySelector(`.btn-plus[data-ability="${ability}"]`);
    const minusBtn = document.querySelector(`.btn-minus[data-ability="${ability}"]`);
    
    // Disable buttons based on constraints
    plusBtn.disabled = (value >= 15 || pointsRemaining <= 0);
    minusBtn.disabled = (value <= 0);
}

// Update points remaining display
function updatePointsRemaining() {
    const display = document.getElementById('pointsRemaining');
    display.textContent = pointsRemaining;
    
    if (pointsRemaining === 0) {
        display.style.color = '#28a745';
    } else if (pointsRemaining < 0) {
        display.style.color = '#dc3545';
    } else {
        display.style.color = '#667eea';
    }
}

// Setup export functionality
function setupExport() {
    const completeBtn = document.getElementById('completeBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            showCharacterAfterCreation();
        });
    }
}

// Setup step navigation
function setupNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
        }
    });
}

// Setup selection buttons for race and class
function setupSelectionButtons() {
    // Gender buttons
    const genderButtons = document.querySelectorAll('.gender-btn');
    genderButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            genderButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('genderSelect').value = btn.dataset.value;
            updatePortraitGrid();
            updateSummary();
        });
    });
    
    // Race buttons
    const raceButtons = document.querySelectorAll('#raceGrid .selection-btn');
    raceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all race buttons
            raceButtons.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            btn.classList.add('selected');
            // Update hidden input
            document.getElementById('raceSelect').value = btn.dataset.value;
            updatePortraitGrid();
            updateSummary();
        });
    });
    
    // Class buttons
    const classButtons = document.querySelectorAll('#classGrid .selection-btn');
    classButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all class buttons
            classButtons.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            btn.classList.add('selected');
            // Update hidden input
            document.getElementById('classSelect').value = btn.dataset.value;
            updateSummary();
        });
    });
    
    // Character name input
    const characterNameInput = document.getElementById('characterName');
    if (characterNameInput) {
        characterNameInput.addEventListener('input', updateSummary);
    }
    
    // Backstory buttons
    const backstoryButtons = document.querySelectorAll('#backstoryGrid .backstory-btn');
    backstoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected class from all backstory buttons
            backstoryButtons.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            btn.classList.add('selected');
            // Update hidden input
            document.getElementById('backstorySelect').value = btn.dataset.value;
            updateSummary();
        });
    });

    // Initialize portrait grid if data already present
    updatePortraitGrid();
}

function updatePortraitGrid() {
    const race = (document.getElementById('raceSelect') || {}).value;
    const gender = (document.getElementById('genderSelect') || {}).value;
    const grid = document.getElementById('portraitGrid');
    const portraitInput = document.getElementById('portraitSelect');
    if (!grid || !portraitInput) return;

    if (!race || !gender) {
        grid.innerHTML = '<div class="empty-message">Select race and gender to view portraits.</div>';
        portraitInput.value = '';
        return;
    }

    const optionsRaw = (portraitLibrary[race] && portraitLibrary[race][gender]) ? portraitLibrary[race][gender] : [];
    const options = optionsRaw.filter(p => p.toLowerCase().includes('standard'));
    if (!options.length) {
        grid.innerHTML = '<div class="empty-message">No portraits available for this selection.</div>';
        portraitInput.value = '';
        return;
    }

    if (!options.includes(portraitInput.value)) {
        portraitInput.value = '';
    }

    grid.innerHTML = options.map((path, index) => `
        <button type="button" class="portrait-card${portraitInput.value === path ? ' selected' : ''}" data-portrait="${path}">
            <img src="${path}" alt="${race} ${gender} portrait ${index + 1}">
            <div class="portrait-name">${race} ${gender}</div>
        </button>
    `).join('');

    grid.querySelectorAll('.portrait-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.portrait-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            portraitInput.value = card.dataset.portrait;
            updateSummary();
        });
    });
}

// Update step display and navigation
function updateStepDisplay() {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Restore selected states
    restoreSelectedStates();
    
    // Update progress bar
    const progressPercent = (currentStep / totalSteps) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    const stepLabel = document.getElementById('currentStepLabel');
    if (stepLabel) {
        stepLabel.textContent = `Step ${currentStep} of ${totalSteps}`;
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'block';
    }
}

// Restore selected states for race, class, and backstory buttons
function restoreSelectedStates() {
    const selectedGender = document.getElementById('genderSelect').value;
    const selectedRace = document.getElementById('raceSelect').value;
    const selectedClass = document.getElementById('classSelect').value;
    const selectedBackstory = document.getElementById('backstorySelect').value;
    
    if (selectedGender) {
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.value === selectedGender) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Restore race selection
    if (selectedRace) {
        document.querySelectorAll('#raceGrid .selection-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.value === selectedRace) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Restore class selection
    if (selectedClass) {
        document.querySelectorAll('#classGrid .selection-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.value === selectedClass) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Restore backstory selection
    if (selectedBackstory) {
        document.querySelectorAll('#backstoryGrid .backstory-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.value === selectedBackstory) {
                btn.classList.add('selected');
            }
        });
    }
}

// Setup summary toggle
function setupSummary() {
    const toggle = document.getElementById('summaryToggle');
    const panel = document.getElementById('summaryPanel');
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        panel.classList.toggle('expanded');
    });
}

// Update summary content
function updateSummary() {
    const content = document.getElementById("summaryContent");
    const characterName = document.getElementById("characterName").value || "Not set";
    const race = document.getElementById("raceSelect").value || "Not selected";
    const className = document.getElementById("classSelect").value || "Not selected";
    const gender = document.getElementById("genderSelect").value || "Not selected";
    const backstory = document.getElementById("backstorySelect").value || "Not selected";

    function getModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    function formatModifier(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    }

    let html = "";

    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">Basic Info</div>';
    html += '<div class="summary-section-content">';
    html += `<div class="summary-item"><span class="summary-item-label">Name:</span><span class="summary-item-value ${characterName === 'Not set' ? 'empty' : ''}">${characterName}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Gender:</span><span class="summary-item-value ${gender === 'Not selected' ? 'empty' : ''}">${gender}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Race:</span><span class="summary-item-value ${race === 'Not selected' ? 'empty' : ''}">${race}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Class:</span><span class="summary-item-value ${className === 'Not selected' ? 'empty' : ''}">${className}</span></div>`;
    html += '</div></div>';

    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">Ability Scores</div>';
    html += '<div class="summary-section-content">';
    html += `<div class="summary-item"><span class="summary-item-label">Health:</span><span class="summary-item-value">${abilityScores.health} (${formatModifier(getModifier(abilityScores.health))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Attack:</span><span class="summary-item-value">${abilityScores.attackPower} (${formatModifier(getModifier(abilityScores.attackPower))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Spell:</span><span class="summary-item-value">${abilityScores.spellPower} (${formatModifier(getModifier(abilityScores.spellPower))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Deceit:</span><span class="summary-item-value">${abilityScores.deceit} (${formatModifier(getModifier(abilityScores.deceit))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Defence:</span><span class="summary-item-value">${abilityScores.defence} (${formatModifier(getModifier(abilityScores.defence))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Magic Resist:</span><span class="summary-item-value">${abilityScores.magicResist} (${formatModifier(getModifier(abilityScores.magicResist))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Intuition:</span><span class="summary-item-value">${abilityScores.intuition} (${formatModifier(getModifier(abilityScores.intuition))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Points:</span><span class="summary-item-value">${pointsRemaining} remaining</span></div>`;
    html += '</div></div>';

    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">Background</div>';
    html += '<div class="summary-section-content">';
    html += `<div class="summary-item"><span class="summary-item-label">Background:</span><span class="summary-item-value ${backstory === 'Not selected' ? 'empty' : ''}">${backstory}</span></div>`;
    html += '</div></div>';

    content.innerHTML = html;
}// Create character instance from form data
function createCharacter() {
    const characterName = document.getElementById('characterName').value || 'Unnamed Character';
    const race = document.getElementById('raceSelect').value || null;
    const className = document.getElementById('classSelect').value || null;
    const gender = document.getElementById('genderSelect').value || null;
    const portrait = document.getElementById('portraitSelect').value || null;
    const backstory = document.getElementById('backstorySelect').value || null;

    return new Character({
        name: characterName,
        race,
        className,
        gender,
        portrait,
        abilityScores: { ...abilityScores },
        backstory,
        experience: 0,
        missionLog: []
    });
}

// Store current character instance globally
let currentCharacter = null;

// Display character on visualization page
function displayCharacter(character) {
    currentCharacter = character;
    const container = document.getElementById('characterVisualization');
    const charNameDisplay = document.getElementById('charNameDisplay');
    if (!container || !charNameDisplay) return;

    try {
        charNameDisplay.textContent = character.name;

        const modifiers = character.getAbilityModifiers();
        const npcData = character.npcData;
        const isNPC = !!npcData;
        const abilityIcons = {
            health: "❤",
            attackPower: "⚔",
            spellPower: "🪄",
            deceit: "🎯",
            defence: "🛡",
            magicResist: "⛔",
            intuition: "👁"
        };
        const abilityLabels = {
            health: "Health",
            attackPower: "Attack Power",
            spellPower: "Spell Power",
            deceit: "Deceit",
            defence: "Defence",
            magicResist: "Magic Resist",
            intuition: "Intuition"
        };
        const createdAt = character.createdAt ? new Date(character.createdAt).toLocaleString() : "Unknown";

        let html = '';

        if (character.portrait) {
            html += `<div class="portrait-preview"><img src="${character.portrait}" alt="${character.name} portrait"></div>`;
        }

        html += '<div class="char-section">';
        html += '<div class="char-section-title">Basic Information</div>';
        html += '<div class="char-info-grid">';
        html += `<div class="char-info-item"><span class="char-info-label">Name</span><span class="char-info-value">${character.name}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">ID</span><span class="char-info-value">${character.id || 'N/A'}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Gender</span><span class="char-info-value">${character.gender || 'Not selected'}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Race</span><span class="char-info-value">${character.race || 'Not selected'}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Class</span><span class="char-info-value">${character.class || 'Not selected'}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Background</span><span class="char-info-value">${character.backstory || 'Not selected'}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Level</span><span class="char-info-value">${character.level}</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Experience</span><span class="char-info-value">${character.experience.toLocaleString()} XP</span></div>`;
        html += `<div class="char-info-item"><span class="char-info-label">Created</span><span class="char-info-value">${createdAt}</span></div>`;
        html += '</div></div>';

        html += '<div class="char-section">';
        html += '<div class="char-section-title">Ability Scores</div>';
        html += '<div class="abilities-grid">';
        const abilities = ["health", "attackPower", "spellPower", "deceit", "defence", "magicResist", "intuition"];
        abilities.forEach(ability => {
            const abilityName = abilityLabels[ability] || ability;
            html += '<div class="ability-card">';
            html += `<span class="ability-icon">${abilityIcons[ability] || ability}</span>`;
            html += `<div class="ability-name">${abilityName}</div>`;
            html += `<div class="ability-score">${character.abilityScores[ability]}</div>`;
            html += `<div class="ability-modifier">${character.formatModifier(modifiers[ability])}</div>`;
            html += '</div>';
        });
        html += '</div></div>';

        if (isNPC) {
            html += '<div class="char-section">';
            html += '<div class="char-section-title">NPC Stats</div>';
            html += '<div class="char-info-grid">';
            html += `<div class="char-info-item"><span class="char-info-label">Hit Points</span><span class="char-info-value">${npcData && npcData.hitpoints !== undefined ? npcData.hitpoints : 'Unknown'}</span></div>`;
            html += `<div class="char-info-item"><span class="char-info-label">Damage</span><span class="char-info-value">${npcData && npcData.damage ? npcData.damage : 'Unknown'}</span></div>`;
            html += '</div>';
            if (npcData && Array.isArray(npcData.loot) && npcData.loot.length > 0) {
                html += '<div class="skills-tags" style="margin-top:12px;">';
                npcData.loot.forEach(item => {
                    html += `<span class="skill-tag">${item}</span>`;
                });
                html += '</div>';
            } else {
                html += '<div class="empty-message">No loot listed</div>';
            }
            html += '</div>';
        }

        html += '<div class="char-section">';
        html += '<div class="char-section-title">Mission Log</div>';
        if (character.missionLog && character.missionLog.length > 0) {
            html += '<div class="mission-log">';
            character.missionLog.forEach(entry => {
                const date = new Date(entry.date).toLocaleString();
                html += '<div class="mission-entry">';
                html += `<div class="mission-date">${date}</div>`;
                html += `<div class="mission-text">${entry.entry}</div>`;
                html += '</div>';
            });
            html += '</div>';
        } else {
            html += '<div class="empty-message">No mission log entries yet</div>';
        }
        html += '</div>';

        container.innerHTML = html;
    } catch (err) {
        console.error('Error displaying character', err);
        if (container) {
            container.innerHTML = '<div class="empty-message">Could not render character.</div>';
        }
    }
}

// Display NPC data by mapping it into a Character object for visualization
function displayNPC(npcData) {
    const character = new Character({
        name: npcData.name || 'Unknown NPC',
        race: npcData.race || 'Unknown',
        className: npcData.class || 'Unknown',
        gender: npcData.gender || 'Not specified',
        abilityScores: { ...npcBaseAbilityScores },
        backstory: npcData.backstory || 'NPC',
        experience: npcData.experience || 0,
        missionLog: npcData.missionLog || []
    });
    character.npcData = {
        hitpoints: npcData.hitpoints,
        damage: npcData.damage,
        loot: Array.isArray(npcData.loot) ? npcData.loot : []
    };
    
    displayCharacter(character);
    showPage('visualizationPage');
}

// Generate a quick NPC with required fields
function generateRandomNPC() {
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const names = [
        'Kara Blackbriar', 'Thorne Ironhand', 'Mira Quickstep', 'Eldrin Dawnwhisper',
        'Seraphine Nightbloom', 'Garruk Stonehide', 'Lyra Stormsong', 'Bram Hollowbrook',
        'Tamsin Farwatch', 'Rurik Stormbreaker'
    ];
    const races = ['Human', 'Elf', 'Dwarf', 'Fairy'];
    const classes = [
        { name: 'Warrior', hitDie: 10 },
        { name: 'Ranger', hitDie: 10 },
        { name: 'Magician', hitDie: 6 },
        { name: 'Paladin', hitDie: 10 }
    ];
    const weapons = [
        { name: 'longsword', dice: '1d8' },
        { name: 'battleaxe', dice: '1d8' },
        { name: 'rapier', dice: '1d8' },
        { name: 'greatsword', dice: '2d6' },
        { name: 'shortbow', dice: '1d6' },
        { name: 'spear', dice: '1d6' },
        { name: 'mace', dice: '1d6' }
    ];
    const lootOptions = [
        'Healing potion',
        'Bag of 25 gold coins',
        'Enchanted dagger',
        'Traveler\'s cloak',
        'Spell scroll (cantrip)',
        'Set of lockpicks',
        'Pearl worth 100 gp',
        'Shortbow with 10 arrows',
        'Ring with family crest',
        'Mysterious map fragment'
    ];
    
    const selectedClass = randomChoice(classes);
    const level = getRandomInt(1, 10);
    const name = randomChoice(names);
    const race = randomChoice(races);
    const weapon = randomChoice(weapons);
    const damageBonus = Math.max(1, Math.floor(level / 2));
    const hitDieAverage = Math.ceil(selectedClass.hitDie / 2) + 1;
    const hitpoints = selectedClass.hitDie + (level - 1) * hitDieAverage + getRandomInt(0, 2);
    
    const shuffledLoot = [...lootOptions].sort(() => Math.random() - 0.5);
    const lootCount = getRandomInt(2, 4);
    const loot = shuffledLoot.slice(0, lootCount);
    
    return {
        name,
        race,
        class: selectedClass.name,
        level,
        damage: `${weapon.dice}+${damageBonus} (${weapon.name})`,
        hitpoints,
        loot
    };
}

// Download NPC JSON to mirror character saves
function downloadNPC(npc) {
    const safeName = (npc.name || 'NPC').replace(/[^a-z0-9]/gi, '_');
    const json = JSON.stringify(npc, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_NPC.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export character to JSON file
function exportCharacter() {
    // Create character instance if not exists
    if (!currentCharacter) {
        currentCharacter = createCharacter();
    }
    
    // Create JSON and download
    const json = JSON.stringify(currentCharacter.toJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter.name.replace(/[^a-z0-9]/gi, '_')}_Character.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show character after creation
function showCharacterAfterCreation() {
    currentCharacter = createCharacter();
    exportCharacter();
    currentStep = 1;
    updateStepDisplay();
    showPage('startPage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
