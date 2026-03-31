// CharacterCreation.js

class CharacterCreation {
    constructor() {
        this.raceClassRestrictions = {
            Human: ['Warrior', 'Mage', 'Rogue'],
            Elf: ['Mage', 'Rogue'],
            Dwarf: ['Warrior'],
            Orc: ['Warrior', 'Rogue']
        };
        this.gameStarted = false;
        this.character = null;
    }

    startNewGame() {
        this.gameStarted = true;
        this.character = this.initializeCharacter();
    }

    initializeCharacter() {
        // Set up default stats, starting zone, gear
        return {
            race: null,
            class: null,
            stats: { strength: 10, agility: 10, intelligence: 10 },
            zone: 'Starting Zone',
            gear: 'Basic Gear'
        };
    }

    validateRaceClassCombo(race, charClass) {
        return this.raceClassRestrictions[race] && this.raceClassRestrictions[race].includes(charClass);
    }
}

module.exports = CharacterCreation;