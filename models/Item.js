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
exports.WeaponModel = exports.ToolModel = exports.ArmorModel = exports.ItemModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ItemSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
    value: {
        type: Number,
        default: 0,
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'],
        default: 'common',
    },
}, { discriminatorKey: 'i_type' });
const ArmorSchema = new mongoose_1.Schema({
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
const WeaponSchema = new mongoose_1.Schema({
    damageType: {
        type: String,
        enum: ['bludgeoning', 'piercing', 'slashing', 'fire', 'cold', 'lightning', 'thunder', 'poison', 'necrotic', 'radiant', 'acid', 'force', 'psychic'],
        required: true
    },
    damageDice: {
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
const ToolSchema = new mongoose_1.Schema({
    category: {
        type: String,
        enum: ['artisan', 'gaming', 'musical', 'other'],
        required: true
    },
    proficiencyType: String
});
// General item update methods
ItemSchema.statics.updateItem = function (itemId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        // Update basic item properties
        if (updateData.name)
            item.name = updateData.name;
        if (updateData.description)
            item.description = updateData.description;
        if (updateData.weight !== undefined)
            item.weight = updateData.weight;
        if (updateData.value !== undefined)
            item.value = updateData.value;
        if (updateData.rarity)
            item.rarity = updateData.rarity;
        yield item.save();
        return item;
    });
};
// Create item method
ItemSchema.statics.create = function (itemData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate that the item data contains a valid type
        if (!itemData.i_type) {
            throw new Error('Item type is required');
        }
        let item;
        // Create the item using the appropriate model based on the type
        switch (itemData.i_type) {
            case 'weapon':
                item = yield WeaponModel.create(itemData);
                break;
            case 'armor':
                item = yield ArmorModel.create(itemData);
                break;
            case 'tool':
                item = yield ToolModel.create(itemData);
                break;
            case 'other':
                item = yield ItemModel.create(itemData);
                break;
            default:
                throw new Error('Invalid item type');
        }
        return item;
    });
};
// Specific update methods for different properties
ItemSchema.statics.updateName = function (itemId, newName) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        item.name = newName;
        yield item.save();
        return item;
    });
};
ItemSchema.statics.updateDescription = function (itemId, newDescription) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        item.description = newDescription;
        yield item.save();
        return item;
    });
};
ItemSchema.statics.updateWeight = function (itemId, newWeight) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        item.weight = newWeight;
        yield item.save();
        return item;
    });
};
ItemSchema.statics.updateValue = function (itemId, newValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        item.value = newValue;
        yield item.save();
        return item;
    });
};
ItemSchema.statics.updateRarity = function (itemId, newRarity) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        item.rarity = newRarity;
        yield item.save();
        return item;
    });
};
// Weapon-specific update methods
ItemSchema.statics.updateWeaponProperties = function (weaponId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        const weapon = yield this.findById(weaponId);
        if (!weapon || weapon.i_type !== 'weapon') {
            throw new Error('Weapon not found');
        }
        if (updateData.damageType)
            weapon.damageType = updateData.damageType;
        if (updateData.damageDice)
            weapon.damageDice = updateData.damageDice;
        if (updateData.properties)
            weapon.properties = updateData.properties;
        if (updateData.range)
            weapon.range = updateData.range;
        if (updateData.category)
            weapon.category = updateData.category;
        if (updateData.twoHanded !== undefined)
            weapon.twoHanded = updateData.twoHanded;
        if (updateData.canThrow !== undefined)
            weapon.canThrow = updateData.canThrow;
        if (updateData.isMelee !== undefined)
            weapon.isMelee = updateData.isMelee;
        yield weapon.save();
        return weapon;
    });
};
// Armor-specific update methods
ItemSchema.statics.updateArmorProperties = function (armorId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        const armor = yield this.findById(armorId);
        if (!armor || armor.i_type !== 'armor') {
            throw new Error('Armor not found');
        }
        if (updateData.armorClass)
            armor.armorClass = updateData.armorClass;
        if (updateData.category)
            armor.category = updateData.category;
        if (updateData.stealthDisadv !== undefined)
            armor.stealthDisadv = updateData.stealthDisadv;
        yield armor.save();
        return armor;
    });
};
// Tool-specific update methods
ItemSchema.statics.updateToolProperties = function (toolId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        const tool = yield this.findById(toolId);
        if (!tool || tool.i_type !== 'tool') {
            throw new Error('Tool not found');
        }
        if (updateData.category)
            tool.category = updateData.category;
        if (updateData.proficiencyType)
            tool.proficiencyType = updateData.proficiencyType;
        yield tool.save();
        return tool;
    });
};
// Delete method
ItemSchema.statics.deleteItem = function (itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const item = yield this.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        yield item.deleteOne();
        return { message: 'Item successfully deleted' };
    });
};
const ItemModel = mongoose_1.default.model('Item', ItemSchema);
exports.ItemModel = ItemModel;
const ArmorModel = ItemModel.discriminator('Armor', ArmorSchema);
exports.ArmorModel = ArmorModel;
const ToolModel = ItemModel.discriminator('Tool', ToolSchema);
exports.ToolModel = ToolModel;
const WeaponModel = ItemModel.discriminator('Weapon', WeaponSchema);
exports.WeaponModel = WeaponModel;
