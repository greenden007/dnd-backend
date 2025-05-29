import mongoose, { Schema } from 'mongoose';

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
ItemSchema.statics.updateItem = async function(itemId: mongoose.Types.ObjectId | string, updateData: any) {
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

// Create item method
ItemSchema.statics.create = async function(itemData: any) {
    // Validate that the item data contains a valid type
    if (!itemData.i_type) {
        throw new Error('Item type is required');
    }

    let item;

    // Create the item using the appropriate model based on the type
    switch (itemData.i_type) {
        case 'weapon':
            item = await WeaponModel.create(itemData);
            break;
        case 'armor':
            item = await ArmorModel.create(itemData);
            break;
        case 'tool':
            item = await ToolModel.create(itemData);
            break;
        case 'other':
            item = await ItemModel.create(itemData);
            break;
        default:
            throw new Error('Invalid item type');
    }

    return item;
}

// Specific update methods for different properties
ItemSchema.statics.updateName = async function(itemId: mongoose.Types.ObjectId | string, newName: string) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.name = newName;
    await item.save();
    return item;
};

ItemSchema.statics.updateDescription = async function(itemId: mongoose.Types.ObjectId | string, newDescription: string) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.description = newDescription;
    await item.save();
    return item;
};

ItemSchema.statics.updateWeight = async function(itemId: mongoose.Types.ObjectId | string, newWeight: number) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.weight = newWeight;
    await item.save();
    return item;
};

ItemSchema.statics.updateValue = async function(itemId: mongoose.Types.ObjectId | string, newValue: number) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.value = newValue;
    await item.save();
    return item;
};

ItemSchema.statics.updateRarity = async function(itemId: mongoose.Types.ObjectId | string, newRarity: string) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    item.rarity = newRarity;
    await item.save();
    return item;
};

// Weapon-specific update methods
ItemSchema.statics.updateWeaponProperties = async function(weaponId: mongoose.Types.ObjectId | string, updateData: any) {
    const weapon = await this.findById(weaponId);
    if (!weapon || weapon.i_type !== 'weapon') {
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
ItemSchema.statics.updateArmorProperties = async function(armorId: mongoose.Types.ObjectId | string, updateData: any) {
    const armor = await this.findById(armorId);
    if (!armor || armor.i_type !== 'armor') {
        throw new Error('Armor not found');
    }

    if (updateData.armorClass) armor.armorClass = updateData.armorClass;
    if (updateData.category) armor.category = updateData.category;
    if (updateData.stealthDisadv !== undefined) armor.stealthDisadv = updateData.stealthDisadv;

    await armor.save();
    return armor;
};

// Tool-specific update methods
ItemSchema.statics.updateToolProperties = async function(toolId: mongoose.Types.ObjectId | string, updateData: any) {
    const tool = await this.findById(toolId);
    if (!tool || tool.i_type !== 'tool') {
        throw new Error('Tool not found');
    }

    if (updateData.category) tool.category = updateData.category;
    if (updateData.proficiencyType) tool.proficiencyType = updateData.proficiencyType;

    await tool.save();
    return tool;
};

// Delete method
ItemSchema.statics.deleteItem = async function(itemId: mongoose.Types.ObjectId | string) {
    const item = await this.findById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    await item.deleteOne();
    return { message: 'Item successfully deleted' };
};

const ItemModel = mongoose.model('Item', ItemSchema);

const ArmorModel = ItemModel.discriminator('Armor', ArmorSchema);
const ToolModel = ItemModel.discriminator('Tool', ToolSchema);
const WeaponModel = ItemModel.discriminator('Weapon', WeaponSchema);

export { ItemModel, ArmorModel, ToolModel, WeaponModel };