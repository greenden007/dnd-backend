import mongoose from 'mongoose';

const SpellSchema = new mongoose.Schema({
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

SpellSchema.statics.updateSpell = async function(spellId: any, spellName: any, spellLevel: any, spellSchool: any, castingTime: any, range: any, components: any, duration: any, attack_save: any, damageType: any, damageDice: any) {
    const spell = await this.findById(spellId);
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
    await spell.save();
    return spell;
}

SpellSchema.statics.deleteSpell = async function(spellId: any) {
    const spell = await this.findById(spellId);
    if (!spell) {
        throw new Error('Spell not found');
    }
    await spell.deleteOne();
    return { message: 'Spell successfully deleted' };
}

SpellSchema.statics.create = async function(spell: any) {
    const newSpell = new this(spell);
    await newSpell.save();
    return newSpell;
}

const SpellModel = mongoose.model('Spell', SpellSchema);
export default SpellModel;
