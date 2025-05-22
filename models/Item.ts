const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: 255,
    },
    i_type: {
        type: String,
        enum: ['weapon', 'armor', 'tool', 'other'],
        required: true,
    },
    weight: {
        type: Number,
        default: 0,
    },
    value: { // in copper pieces
        type: Number,
        default: 0,
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'],
        default: 'common',
    },
}, { discriminatorKey: 'i_type' });

const ArmorSchema = new Schema({
    armorClass: {
        base: Number, // 0 if not armor
        dexBonus: Boolean,
        maxDexBonus: Number,
        shieldBonus: Number, // 0 if not a shield
    },
    category: {
        type: String,
        enum: ['light', 'medium', 'heavy', 'shield'],
        required: true
    },
    stealthDisadv: {
        type: Boolean,
        default: false
    }
});

const WeaponSchema = new Schema({
    damageType: {
        type: String,
        enum: ['bludgeoning', 'piercing', 'slashing', 'fire', 'cold', 'lightning', 'thunder', 'poison', 'necrotic', 'radiant', 'acid', 'force', 'psychic'],
        required: true
    },
    damageDice: { // Save as regex and parse on the frontend "1d8+2"
        type: String,
        required: true
    },
    properties: {
        type: [String]
    },
    range: {
        normal: Number,
        maximum: Number,
    },
    category: {
        type: String,
        enum: ['simple', 'martial'],
        required: true
    },
    twoHanded: {
        type: Boolean,
        default: false
    },
    canThrow: {
        type: Boolean,
        default: false
    },
    isMelee: {
        type: Boolean,
        default: true
    }
});

const ToolSchema = new Schema({
    category: {
        type: String,
        enum: ['artisan', 'gaming', 'musical', 'other'],
        required: true
    },
    proficiencyType: String
});

const Item = mongoose.model('Item', ItemSchema);

const Armor = Item.discriminator('Armor', ArmorSchema);
const Tool = Item.discriminator('Tool', ToolSchema);
const Weapon = Item.discriminator('Weapon', WeaponSchema);

