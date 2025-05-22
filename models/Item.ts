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

// General item update methods
ItemSchema.statics.updateItem = async function(itemId: any, updateData: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    // Update basic item properties
    if (updateData.name) item.name = updateData.name;
    if (updateData.description) item.description = updateData.description;
    if (updateData.weight !== undefined) item.weight = updateData.weight;
    if (updateData.value !== undefined) item.value = updateData.value;
    if (updateData.rarity) item.rarity = updateData.rarity;

    await item.save();
    return item;
};

// Specific update methods for different properties
ItemSchema.statics.updateName = async function(itemId: any, newName: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.name = newName;
    await item.save();
    return item;
};

ItemSchema.statics.updateDescription = async function(itemId: any, newDescription: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.description = newDescription;
    await item.save();
    return item;
};

ItemSchema.statics.updateWeight = async function(itemId: any, newWeight: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.weight = newWeight;
    await item.save();
    return item;
};

ItemSchema.statics.updateValue = async function(itemId: any, newValue: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.value = newValue;
    await item.save();
    return item;
};

ItemSchema.statics.updateRarity = async function(itemId: any, newRarity: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.rarity = newRarity;
    await item.save();
    return item;
};

// Weapon-specific update methods
ItemSchema.statics.updateWeaponProperties = async function(weaponId: any, updateData: any) {
    const weapon = await this.model('Weapon').findById(weaponId);
    if (!weapon) {
        throw new Error('Weapon not found');
    }

    if (updateData.damageType) weapon.damageType = updateData.damageType;
    if (updateData.damageDice) weapon.damageDice = updateData.damageDice;
    if (updateData.properties) weapon.properties = updateData.properties;
    if (updateData.range) weapon.range = updateData.range;
    if (updateData.category) weapon.category = updateData.category;
    if (updateData.twoHanded !== undefined) weapon.twoHanded = updateData.twoHanded;
    if (updateData.canThrow !== undefined) weapon.canThrow = updateData.canThrow;
    if (updateData.isMelee !== undefined) weapon.isMelee = updateData.isMelee;

    await weapon.save();
    return weapon;
};

// Armor-specific update methods
ItemSchema.statics.updateArmorProperties = async function(armorId: any, updateData: any) {
    const armor = await this.model('Armor').findById(armorId);
    if (!armor) {
        throw new Error('Armor not found');
    }

    if (updateData.armorClass) armor.armorClass = updateData.armorClass;
    if (updateData.category) armor.category = updateData.category;
    if (updateData.stealthDisadv !== undefined) armor.stealthDisadv = updateData.stealthDisadv;

    await armor.save();
    return armor;
};

// Tool-specific update methods
ItemSchema.statics.updateToolProperties = async function(toolId: any, updateData: any) {
    const tool = await this.model('Tool').findById(toolId);
    if (!tool) {
        throw new Error('Tool not found');
    }

    if (updateData.category) tool.category = updateData.category;
    if (updateData.proficiencyType) tool.proficiencyType = updateData.proficiencyType;

    await tool.save();
    return tool;
};

// Delete method
ItemSchema.statics.deleteItem = async function(itemId: any) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    await item.deleteOne();
    return { message: 'Item successfully deleted' };
};

const Item = mongoose.model('Item', ItemSchema);

const Armor = Item.discriminator('Armor', ArmorSchema);
const Tool = Item.discriminator('Tool', ToolSchema);
const Weapon = Item.discriminator('Weapon', WeaponSchema);

