// Core Character model used across the app
class Character {
    constructor({
        id,
        name,
        race,
        className,
        gender,
        portrait,
        abilityScores,
        backstory,
        experience,
        missionLog,
        createdAt
    } = {}) {
        const defaultAbilities = {
            health: 8,
            attackPower: 8,
            spellPower: 8,
            deceit: 8,
            defence: 8,
            magicResist: 8,
            intuition: 8
        };
        const fallbackId = `char_${Date.now().toString(36)}_${Math.random().toString(16).slice(2)}`;
        const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : fallbackId;
        this.id = id || generatedId;
        this.name = name || 'Unnamed Character';
        this.race = race || null;
        this.class = className || null;
        this.gender = gender || null;
        this.portrait = portrait || null;
        this.abilityScores = abilityScores ? { ...defaultAbilities, ...abilityScores } : { ...defaultAbilities };
        this.backstory = backstory || null;
        this.experience = experience || 0;
        this.level = Character.getLevelFromExperience(this.experience);
        this.missionLog = missionLog || [];
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
    }

    getAbilityModifier(ability) {
        return Math.floor((this.abilityScores[ability] - 10) / 2);
    }

    formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }

    getAbilityModifiers() {
        return {
            health: this.getAbilityModifier('health'),
            attackPower: this.getAbilityModifier('attackPower'),
            spellPower: this.getAbilityModifier('spellPower'),
            deceit: this.getAbilityModifier('deceit'),
            defence: this.getAbilityModifier('defence'),
            magicResist: this.getAbilityModifier('magicResist'),
            intuition: this.getAbilityModifier('intuition')
        };
    }

    addExperience(amount) {
        if (amount > 0) {
            this.experience += amount;
            this.updateLevel();
        }
    }

    updateLevel() {
        this.level = Character.getLevelFromExperience(this.experience);
    }

    addMissionLogEntry(entry) {
        if (entry) {
            this.missionLog.push({
                date: new Date(),
                entry
            });
        }
    }

    exportToText() {
        const modifiers = this.getAbilityModifiers();
        let text = '';
        text += '='.repeat(50) + '\n';
        text += 'BLOOD AND DECEIT CHARACTER SHEET\n';
        text += '='.repeat(50) + '\n\n';
        text += `CHARACTER ID: ${this.id}\n`;
        text += `NAME: ${this.name}\n`;
        text += `GENDER: ${this.gender || 'Not selected'}\n`;
        text += `RACE: ${this.race || 'Not selected'}\n`;
        text += `CLASS: ${this.class || 'Not selected'}\n`;
        text += `LEVEL: ${this.level}\n`;
        text += `EXPERIENCE: ${this.experience}\n\n`;
        text += '-'.repeat(50) + '\n';
        text += 'ABILITY SCORES\n';
        text += '-'.repeat(50) + '\n';
        text += `Health:       ${this.abilityScores.health} (${this.formatModifier(modifiers.health)})\n`;
        text += `Attack Power: ${this.abilityScores.attackPower} (${this.formatModifier(modifiers.attackPower)})\n`;
        text += `Spell Power:  ${this.abilityScores.spellPower} (${this.formatModifier(modifiers.spellPower)})\n`;
        text += `Deceit:       ${this.abilityScores.deceit} (${this.formatModifier(modifiers.deceit)})\n`;
        text += `Defence:      ${this.abilityScores.defence} (${this.formatModifier(modifiers.defence)})\n`;
        text += `Magic Resist: ${this.abilityScores.magicResist} (${this.formatModifier(modifiers.magicResist)})\n`;
        text += `Intuition:    ${this.abilityScores.intuition} (${this.formatModifier(modifiers.intuition)})\n\n`;
        text += '-'.repeat(50) + '\n';
        text += 'BACKGROUND\n';
        text += '-'.repeat(50) + '\n';
        text += `Background: ${this.backstory || 'Not selected'}\n\n`;
        if (this.missionLog && this.missionLog.length > 0) {
            text += '-'.repeat(50) + '\n';
            text += 'MISSION LOG\n';
            text += '-'.repeat(50) + '\n';
            this.missionLog.forEach(entry => {
                const date = new Date(entry.date).toLocaleString();
                text += `[${date}] ${entry.entry}\n`;
            });
            text += '\n';
        }
        text += '='.repeat(50) + '\n';
        text += `Created on: ${this.createdAt.toLocaleString()}\n`;
        text += '='.repeat(50) + '\n';
        return text;
    }

    toJSON() {
        // Level is derived from experience on load; we omit it from saves to avoid stale data.
        return {
            id: this.id,
            name: this.name,
            race: this.race,
            class: this.class,
            gender: this.gender,
            portrait: this.portrait,
            abilityScores: this.abilityScores,
            backstory: this.backstory,
            experience: this.experience,
            missionLog: this.missionLog,
            createdAt: this.createdAt.toISOString()
        };
    }

    static fromJSON(json) {
        // Map legacy ability names to new schema when needed
        const legacy = json.abilityScores || {};
        const mappedAbilities = {
            health: Number(legacy.constitution ?? legacy.health ?? 8),
            attackPower: Number(legacy.strength ?? legacy.dexterity ?? legacy.attackPower ?? 8),
            spellPower: Number(legacy.intelligence ?? legacy.spellPower ?? 8),
            deceit: Number(legacy.charisma ?? legacy.deceit ?? 8),
            defence: Number(legacy.wisdom ?? legacy.defence ?? 8),
            magicResist: Number(legacy.wisdom ?? legacy.magicResist ?? 8),
            intuition: Number(legacy.intelligence ?? legacy.wisdom ?? legacy.intuition ?? 8)
        };
        return new Character({
            id: json.id,
            name: json.name,
            race: json.race,
            className: json.class,
            gender: json.gender,
            portrait: json.portrait || null,
            abilityScores: mappedAbilities,
            backstory: json.backstory,
            experience: json.experience || 0,
            missionLog: Array.isArray(json.missionLog) ? json.missionLog : [],
            createdAt: json.createdAt
        });
    }

    // XP progression table (cumulative total XP required to reach each level).
    // Formula for the per-level XP increment (Level n -> n+1):
    //   increment_n = round(200 * 1.12^(n - 1))
    // The table below is precomputed from that formula for quick lookup.
    static xpThresholds = [
        0, 200, 424, 675, 956, 1271, 1623, 2018, 2460, 2955,
        3510, 4131, 4827, 5606, 6479, 7456, 8551, 9777, 11150, 12688,
        14410, 16340, 18501, 20921, 23631, 26667, 30067, 33875, 38140, 42917,
        48267, 54259, 60970, 68486, 76904, 86333, 96893, 108720, 121966, 136802,
        153418, 172028, 192872, 216217, 242363, 271646, 304444, 341177, 382318, 428396
    ];

    static getLevelFromExperience(exp = 0) {
        const thresholds = Character.xpThresholds;
        if (!Array.isArray(thresholds) || thresholds.length === 0) return 1;
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (exp >= thresholds[i]) {
                return i + 1;
            }
        }
        return 1;
    }
}

// Expose globally
window.Character = Character;
