"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const utils = __importStar(require("./utilities"));
const CharacterSchema = new mongoose_1.default.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    campaign: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Campaign',
    },
    name: String,
    classes: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Class',
    },
    subclasses: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'SubClass',
    },
    levels: {
        type: [Number]
    },
    race: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Race',
    },
    background: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    baseStats: {
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
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Armor',
    },
    weaponProficiencies: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Weapon',
    },
    initiative: {
        type: Number,
        default: 0,
    },
    toolsProficiencies: {
        type: [mongoose_1.Schema.Types.ObjectId],
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
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Weapon',
    },
    activeArmor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Armor',
    },
    activeShield: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Armor',
    },
    equipment: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Tool',
    },
    currency: {
        type: utils.currency,
        default: utils.currency,
    },
    features: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Feature',
    },
    spells: {
        type: [mongoose_1.Schema.Types.ObjectId],
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
});
CharacterSchema.statics.create = function (characterData) {
    return __awaiter(this, void 0, void 0, function* () {
        const character = new this(characterData);
        yield character.save();
        return character;
    });
};
CharacterSchema.statics.updateCharacter = function (characterId, newCharacter) {
    return __awaiter(this, void 0, void 0, function* () {
        const character = yield this.findById(characterId);
        if (!character) {
            throw new Error('Character not found');
        }
        for (const key in newCharacter) {
            if (key !== '_id' && key !== '__v') {
                character[key] = newCharacter[key];
            }
        }
        yield character.save();
        return character;
    });
};
CharacterSchema.statics.deleteCharacter = function (characterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const character = yield this.findById(characterId);
        if (!character) {
            throw new Error('Character not found');
        }
        yield character.deleteOne();
        return { message: 'Character successfully deleted' };
    });
};
const CharacterModel = mongoose_1.default.model('Character', CharacterSchema);
exports.default = CharacterModel;
