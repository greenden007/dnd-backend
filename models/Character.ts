import mongoose, { Schema } from 'mongoose';
import * as utils from './utilities';

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
    subclasses: {
        type: [Schema.Types.ObjectId],
        ref: 'SubClass',
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
        type: utils.statBlock,
        default: utils.statBlock,
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
    initiative: {
        type: Number,
        default: 0,
    },
    toolsProficiencies: {
        type: [Schema.Types.ObjectId],
        ref: 'Tool',
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
        ref: 'Armor',
    },
    equipment: {
        type: [Schema.Types.ObjectId],
        ref: 'Tool',
    },
    currency: {
        type: utils.currency,
        default: utils.currency,
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
    bio: {
        type: String,
        default: '',
        maxLength: 511,
    }
})

CharacterSchema.statics.create = async function(characterData: any) {
    const character = new this(characterData);
    await character.save();
    return character;
}

CharacterSchema.statics.updateCharacter = async function(characterId: any, newCharacter: any) {
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
    return character;
}

CharacterSchema.statics.deleteCharacter = async function(characterId: any) {
    const character = await this.findById(characterId);
    if (!character) {
        throw new Error('Character not found');
    }

    await character.deleteOne();
    return { message: 'Character successfully deleted' };
}

const CharacterModel = mongoose.model('Character', CharacterSchema);
export default CharacterModel;
