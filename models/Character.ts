const Schema = require('mongoose').Schema;
require('models/utilities')

const CharacterSchema = {
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
        type: [String]
    },
    weaponProficiencies: {
        type: [String]
    },
    toolsProficiencies: {
        type: [String]
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
}

const Character = mongoose.model('Character', CharacterSchema);
module.exports = Character;
