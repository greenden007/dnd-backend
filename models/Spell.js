"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SpellSchema = new mongoose_1.default.Schema({
    spellName: {
        type: String,
        required: true,
    },
    spellLevel: {
        type: Number,
        required: true,
    },
    spellSchool: {
        type: String,
        enum: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'],
        required: true
    },
    castingTime: {
        type: String,
        required: true,
    },
    range: {
        type: String,
        required: true,
    },
    components: {
        type: [String],
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    attack_save: {
        type: String,
        enum: ['None', 'Attack', 'Save'],
        required: true,
    },
    damageType: {
        type: String,
        enum: ['bludgeoning', 'piercing', 'slashing', 'fire', 'cold', 'lightning', 'thunder', 'poison', 'necrotic', 'radiant', 'acid', 'force', 'psychic', 'none'], // none for non-damaging spells
    },
    damageDice: {
        type: String,
        default: 'none', // Save as regex and parse on the frontend "1d8+2". For cantrip scaling, do on frontend.
    },
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    }
});
SpellSchema.statics.updateSpell = function (spellId, spellName, spellLevel, spellSchool, castingTime, range, components, duration, attack_save, damageType, damageDice) {
    return __awaiter(this, void 0, void 0, function* () {
        const spell = yield this.findById(spellId);
        if (!spell) {
            throw new Error('Spell not found');
        }
        spell.spellName = spellName || spell.spellName;
        spell.spellLevel = spellLevel || spell.spellLevel;
        spell.spellSchool = spellSchool || spell.spellSchool;
        spell.castingTime = castingTime || spell.castingTime;
        spell.range = range || spell.range;
        spell.components = components || spell.components;
        spell.duration = duration || spell.duration;
        spell.attack_save = attack_save || spell.attack_save;
        spell.damageType = damageType || spell.damageType;
        spell.damageDice = damageDice || spell.damageDice;
        yield spell.save();
        return spell;
    });
};
SpellSchema.statics.deleteSpell = function (spellId) {
    return __awaiter(this, void 0, void 0, function* () {
        const spell = yield this.findById(spellId);
        if (!spell) {
            throw new Error('Spell not found');
        }
        yield spell.deleteOne();
        return { message: 'Spell successfully deleted' };
    });
};
SpellSchema.statics.create = function (spell) {
    return __awaiter(this, void 0, void 0, function* () {
        const newSpell = new this(spell);
        yield newSpell.save();
        return newSpell;
    });
};
const SpellModel = mongoose_1.default.model('Spell', SpellSchema);
exports.default = SpellModel;
