// D&D Skills list
const skills = [
    { name: 'Acrobatics', ability: 'Dexterity' },
    { name: 'Animal Handling', ability: 'Wisdom' },
    { name: 'Arcana', ability: 'Intelligence' },
    { name: 'Athletics', ability: 'Strength' },
    { name: 'Deception', ability: 'Charisma' },
    { name: 'History', ability: 'Intelligence' },
    { name: 'Insight', ability: 'Wisdom' },
    { name: 'Intimidation', ability: 'Charisma' },
    { name: 'Investigation', ability: 'Intelligence' },
    { name: 'Medicine', ability: 'Wisdom' },
    { name: 'Nature', ability: 'Intelligence' },
    { name: 'Perception', ability: 'Wisdom' },
    { name: 'Performance', ability: 'Charisma' },
    { name: 'Persuasion', ability: 'Charisma' },
    { name: 'Religion', ability: 'Intelligence' },
    { name: 'Sleight of Hand', ability: 'Dexterity' },
    { name: 'Stealth', ability: 'Dexterity' },
    { name: 'Survival', ability: 'Wisdom' }
];

// Ability scores state
const abilityScores = {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8
};

let pointsRemaining = 27;
let currentStep = 1;
const totalSteps = 7;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeSkills();
    initializeAbilityScores();
    setupExport();
    setupNavigation();
    setupSelectionButtons();
    setupSummary();
    updateStepDisplay();
    updateSummary();
});

// Populate skills checkboxes
function initializeSkills() {
    const container = document.getElementById('skillsContainer');
    skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `skill-${skill.name}`;
        checkbox.value = skill.name;
        checkbox.addEventListener('change', updateSummary);
        
        const label = document.createElement('label');
        label.htmlFor = `skill-${skill.name}`;
        label.textContent = `${skill.name} (${skill.ability.substring(0, 3).toUpperCase()})`;
        
        skillItem.appendChild(checkbox);
        skillItem.appendChild(label);
        container.appendChild(skillItem);
    });
}

// Initialize ability score controls
function initializeAbilityScores() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    abilities.forEach(ability => {
        const plusBtn = document.querySelector(`.btn-plus[data-ability="${ability}"]`);
        const minusBtn = document.querySelector(`.btn-minus[data-ability="${ability}"]`);
        const input = document.getElementById(ability);
        
        plusBtn.addEventListener('click', () => adjustAbilityScore(ability, 1));
        minusBtn.addEventListener('click', () => adjustAbilityScore(ability, -1));
        
        updateAbilityScoreDisplay(ability);
    });
    
    updatePointsRemaining();
}

// Adjust ability score
function adjustAbilityScore(ability, change) {
    const currentValue = abilityScores[ability];
    const newValue = currentValue + change;
    
    // Check constraints
    if (newValue < 8 || newValue > 15) {
        return;
    }
    
    // Check if we have enough points
    if (change > 0 && pointsRemaining <= 0) {
        return;
    }
    
    // Calculate point cost (cost increases as score increases)
    let pointCost = 1;
    if (change > 0) {
        if (currentValue >= 13) {
            pointCost = 2;
        }
        if (pointsRemaining < pointCost) {
            return;
        }
    } else {
        // When decreasing, we get points back
        if (currentValue > 13) {
            pointCost = 2;
        }
    }
    
    abilityScores[ability] = newValue;
    pointsRemaining -= change > 0 ? pointCost : -pointCost;
    
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
    minusBtn.disabled = (value <= 8);
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
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportCharacter);
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
    
    // Appearance inputs
    const appearanceInputs = ['height', 'weight', 'hairColor', 'eyeColor', 'skinColor', 'distinguishingFeatures', 'background'];
    appearanceInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateSummary);
        }
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
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    
    // Update step indicator
    document.getElementById('currentStep').textContent = currentStep;
    
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

// Restore selected states for race and class buttons
function restoreSelectedStates() {
    const selectedRace = document.getElementById('raceSelect').value;
    const selectedClass = document.getElementById('classSelect').value;
    
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
    const content = document.getElementById('summaryContent');
    
    // Get all character data
    const characterName = document.getElementById('characterName').value || 'Not set';
    const race = document.getElementById('raceSelect').value || 'Not selected';
    const className = document.getElementById('classSelect').value || 'Not selected';
    
    // Get selected skills
    const selectedSkills = [];
    skills.forEach(skill => {
        const checkbox = document.getElementById(`skill-${skill.name}`);
        if (checkbox && checkbox.checked) {
            selectedSkills.push(skill.name);
        }
    });
    
    // Get appearance
    const height = document.getElementById('height').value || 'Not set';
    const weight = document.getElementById('weight').value || 'Not set';
    const hairColor = document.getElementById('hairColor').value || 'Not set';
    const eyeColor = document.getElementById('eyeColor').value || 'Not set';
    const skinColor = document.getElementById('skinColor').value || 'Not set';
    const distinguishingFeatures = document.getElementById('distinguishingFeatures').value || 'None';
    const background = document.getElementById('background').value || 'None';
    
    // Calculate modifiers
    function getModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    function formatModifier(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    }
    
    // Build summary HTML
    let html = '';
    
    // Basic Info
    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">👤 Basic Info</div>';
    html += '<div class="summary-section-content">';
    html += `<div class="summary-item"><span class="summary-item-label">Name:</span><span class="summary-item-value ${characterName === 'Not set' ? 'empty' : ''}">${characterName}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Race:</span><span class="summary-item-value ${race === 'Not selected' ? 'empty' : ''}">${race}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Class:</span><span class="summary-item-value ${className === 'Not selected' ? 'empty' : ''}">${className}</span></div>`;
    html += '</div></div>';
    
    // Ability Scores
    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">⚡ Ability Scores</div>';
    html += '<div class="summary-section-content">';
    html += `<div class="summary-item"><span class="summary-item-label">STR:</span><span class="summary-item-value">${abilityScores.strength} (${formatModifier(getModifier(abilityScores.strength))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">DEX:</span><span class="summary-item-value">${abilityScores.dexterity} (${formatModifier(getModifier(abilityScores.dexterity))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">CON:</span><span class="summary-item-value">${abilityScores.constitution} (${formatModifier(getModifier(abilityScores.constitution))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">INT:</span><span class="summary-item-value">${abilityScores.intelligence} (${formatModifier(getModifier(abilityScores.intelligence))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">WIS:</span><span class="summary-item-value">${abilityScores.wisdom} (${formatModifier(getModifier(abilityScores.wisdom))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">CHA:</span><span class="summary-item-value">${abilityScores.charisma} (${formatModifier(getModifier(abilityScores.charisma))})</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Points:</span><span class="summary-item-value">${pointsRemaining} remaining</span></div>`;
    html += '</div></div>';
    
    // Skills
    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">🎯 Skills</div>';
    if (selectedSkills.length > 0) {
        html += '<div class="summary-skills-list">';
        selectedSkills.forEach(skill => {
            html += `<span class="summary-skill-tag">${skill}</span>`;
        });
        html += '</div>';
    } else {
        html += '<div class="summary-section-content"><span class="summary-item-value empty">No skills selected</span></div>';
    }
    html += '</div>';
    
    // Appearance
    html += '<div class="summary-section">';
    html += '<div class="summary-section-title">🎨 Appearance</div>';
    html += '<div class="summary-section-content">';
    html += `<div class="summary-item"><span class="summary-item-label">Height:</span><span class="summary-item-value ${height === 'Not set' ? 'empty' : ''}">${height}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Weight:</span><span class="summary-item-value ${weight === 'Not set' ? 'empty' : ''}">${weight}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Hair:</span><span class="summary-item-value ${hairColor === 'Not set' ? 'empty' : ''}">${hairColor}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Eyes:</span><span class="summary-item-value ${eyeColor === 'Not set' ? 'empty' : ''}">${eyeColor}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Skin:</span><span class="summary-item-value ${skinColor === 'Not set' ? 'empty' : ''}">${skinColor}</span></div>`;
    if (distinguishingFeatures !== 'None') {
        html += `<div class="summary-item"><span class="summary-item-label">Features:</span><span class="summary-item-value">${distinguishingFeatures.substring(0, 50)}${distinguishingFeatures.length > 50 ? '...' : ''}</span></div>`;
    }
    html += '</div></div>';
    
    // Background
    if (background !== 'None') {
        html += '<div class="summary-section">';
        html += '<div class="summary-section-title">📖 Background</div>';
        html += `<div class="summary-section-content"><span class="summary-item-value">${background.substring(0, 100)}${background.length > 100 ? '...' : ''}</span></div>`;
        html += '</div>';
    }
    
    content.innerHTML = html;
}

// Export character to text file
function exportCharacter() {
    const characterName = document.getElementById('characterName').value || 'Unnamed Character';
    const race = document.getElementById('raceSelect').value || 'Not selected';
    const className = document.getElementById('classSelect').value || 'Not selected';
    
    // Get selected skills
    const selectedSkills = [];
    skills.forEach(skill => {
        const checkbox = document.getElementById(`skill-${skill.name}`);
        if (checkbox.checked) {
            selectedSkills.push(skill.name);
        }
    });
    
    // Get appearance details
    const height = document.getElementById('height').value || 'Not specified';
    const weight = document.getElementById('weight').value || 'Not specified';
    const hairColor = document.getElementById('hairColor').value || 'Not specified';
    const eyeColor = document.getElementById('eyeColor').value || 'Not specified';
    const skinColor = document.getElementById('skinColor').value || 'Not specified';
    const distinguishingFeatures = document.getElementById('distinguishingFeatures').value || 'None';
    const background = document.getElementById('background').value || 'None';
    
    // Calculate ability modifiers
    function getModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    function formatModifier(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    }
    
    // Build character sheet text
    let characterSheet = '';
    characterSheet += '='.repeat(50) + '\n';
    characterSheet += 'DUNGEONS & DRAGONS CHARACTER SHEET\n';
    characterSheet += '='.repeat(50) + '\n\n';
    
    characterSheet += `CHARACTER NAME: ${characterName}\n`;
    characterSheet += `RACE: ${race}\n`;
    characterSheet += `CLASS: ${className}\n\n`;
    
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += 'ABILITY SCORES\n';
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += `Strength:     ${abilityScores.strength} (${formatModifier(getModifier(abilityScores.strength))})\n`;
    characterSheet += `Dexterity:    ${abilityScores.dexterity} (${formatModifier(getModifier(abilityScores.dexterity))})\n`;
    characterSheet += `Constitution: ${abilityScores.constitution} (${formatModifier(getModifier(abilityScores.constitution))})\n`;
    characterSheet += `Intelligence: ${abilityScores.intelligence} (${formatModifier(getModifier(abilityScores.intelligence))})\n`;
    characterSheet += `Wisdom:       ${abilityScores.wisdom} (${formatModifier(getModifier(abilityScores.wisdom))})\n`;
    characterSheet += `Charisma:     ${abilityScores.charisma} (${formatModifier(getModifier(abilityScores.charisma))})\n\n`;
    
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += 'SKILL PROFICIENCIES\n';
    characterSheet += '-' .repeat(50) + '\n';
    if (selectedSkills.length > 0) {
        selectedSkills.forEach(skill => {
            characterSheet += `• ${skill}\n`;
        });
    } else {
        characterSheet += 'None selected\n';
    }
    characterSheet += '\n';
    
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += 'APPEARANCE\n';
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += `Height: ${height}\n`;
    characterSheet += `Weight: ${weight}\n`;
    characterSheet += `Hair Color: ${hairColor}\n`;
    characterSheet += `Eye Color: ${eyeColor}\n`;
    characterSheet += `Skin Color: ${skinColor}\n`;
    characterSheet += `Distinguishing Features: ${distinguishingFeatures}\n\n`;
    
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += 'BACKGROUND/BACKSTORY\n';
    characterSheet += '-' .repeat(50) + '\n';
    characterSheet += `${background}\n\n`;
    
    characterSheet += '='.repeat(50) + '\n';
    characterSheet += `Generated on: ${new Date().toLocaleString()}\n`;
    characterSheet += '='.repeat(50) + '\n';
    
    // Create and download the file
    const blob = new Blob([characterSheet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_CharacterSheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

