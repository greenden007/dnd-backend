const Schema = require('mongoose').Schema;
require('models/utilities')

const CharacterSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'Campaign',
    },
    name: String,
    classes: {
        type: [Schema.Types.ObjectId],
        ref: 'Class',
    },
    levels: {
        type: [Number]
    },
    race: {
        type: [Schema.Types.ObjectId],
        ref: 'Race',
    },
    background: {
        type: Schema.Types.ObjectId,
        ref: 'Background',
    },
    alignment: String,
    proficiencyBonus: {
        type: Number,
        default: 2,
    },
    savingThrows: {
        type: [String]
    },
    baseStats: { // Base stats are the raw stats before any modifiers
        type: statBlock,
        default: statBlock,
    },
    skillProficiencies: {
        type: [String]
    },
    skillExpertise: {
        type: [String]
    },
    languages: {
        type: [String]
    },
    armorProficiencies: {
        type: [Schema.Types.ObjectId],
        ref: 'Armor',
    },
    weaponProficiencies: {
        type: [Schema.Types.ObjectId],
        ref: 'Weapon',
    },
    toolsProficiencies: {
        type: [Schema.Types.ObjectId],
        ref: 'Item',
    },
    maxHitPoints: {
        type: Number,
        default: 0,
    },
    currentHitPoints: {
        type: Number,
        default: 0,
    },
    weapons: {
        type: [Schema.Types.ObjectId],
        ref: 'Weapon',
    },
    activeArmor: {
        type: Schema.Types.ObjectId,
        ref: 'Armor',
    },
    activeShield: {
        type: Schema.Types.ObjectId,
        ref: 'Shield',
    },
    equipment: {
        type: [Schema.Types.ObjectId],
        ref: 'Item',
    },
    currency: {
        type: currency,
        default: currency,
    },
    features: {
        type: [Schema.Types.ObjectId],
        ref: 'Feature',
    },
    spells: {
        type: [Schema.Types.ObjectId],
        ref: 'Spell',
    },
    spellSlotMax: {
        type: [Number],
        default: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    spellSlotsUsed: {
        type: [Number],
        default: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    characterAppearance: {
        type: String,
        default: '',
        maxLength: 511,
    }
})

const updateCharacter = async (characterId: any, newCharacter: any) => {
    const character = await this.findById(characterId);
    if (!character) {
        throw new Error('Character not found');
    }
    for (const key in newCharacter) {
        if (key !== '_id' && key !== '__v') {
            character[key] = newCharacter[key];
        }
    }
    await character.save();
}

const deleteCharacter = async (characterId: any) => {
    const character = await this.findById(characterId);
    if (!character) {
        throw new Error('Character not found');
    }

    await character.remove();
}

const Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
