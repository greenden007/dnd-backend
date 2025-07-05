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
const ClassSchema = new mongoose_1.default.Schema({
    lvlUnlocks: {
        type: Map,
        of: {
            type: [mongoose_1.default.Schema.Types.ObjectId],
            ref: 'Feature',
        }
    },
    hitDie: {
        type: Number,
        required: true,
    },
    armorProficiencies: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: 'Armor',
    },
    weaponProficiencies: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: 'Weapon',
    },
    toolProficiencies: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: 'Item',
    },
    savingThrows: {
        type: [String],
    },
    skillProficiencies: {
        type: [String],
    },
    baseEquipment: {
        type: [[mongoose_1.default.Schema.Types.ObjectId]],
        ref: 'Item',
    },
    multiclassing: {
        statRequirements: {
            type: [[String]], // [["str", "dex"]] for either or, ["str", "dex", "con"] for each >= 13
            required: true,
        }
    },
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    }
});
ClassSchema.statics.create = function (campaignData) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = new this(campaignData);
        yield classObj.save();
        return classObj;
    });
};
ClassSchema.statics.addLevelUnlock = function (classId, level, featureId) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        if (!classObj.lvlUnlocks.has(level.toString())) {
            classObj.lvlUnlocks.set(level.toString(), []);
        }
        classObj.lvlUnlocks.get(level.toString()).push(featureId);
        yield classObj.save();
        return classObj;
    });
};
ClassSchema.statics.removeLevelUnlock = function (classId, level, featureId) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        if (classObj.lvlUnlocks.has(level.toString())) {
            classObj.lvlUnlocks.set(level.toString(), classObj.lvlUnlocks.get(level.toString()).filter((id) => id.toString() !== featureId.toString()));
            yield classObj.save();
            return classObj;
        }
        else {
            throw new Error('Level unlock not found');
        }
    });
};
ClassSchema.statics.updateHitDie = function (classId, newHitDie) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.hitDie = newHitDie;
        yield classObj.save();
        return classObj;
    });
};
ClassSchema.statics.updateArmorProficiencies = function (classId, newArmorProficiencies) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.armorProficiencies = newArmorProficiencies;
        yield classObj.save();
    });
};
ClassSchema.statics.updateWeaponProficiencies = function (classId, newWeaponProficiencies) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.weaponProficiencies = newWeaponProficiencies;
        yield classObj.save();
    });
};
ClassSchema.statics.updateToolProficiencies = function (classId, newToolProficiencies) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.toolProficiencies = newToolProficiencies;
        yield classObj.save();
    });
};
ClassSchema.statics.updateSavingThrows = function (classId, newSavingThrows) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.savingThrows = newSavingThrows;
        yield classObj.save();
    });
};
ClassSchema.statics.updateSkillProficiencies = function (classId, newSkillProficiencies) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.skillProficiencies = newSkillProficiencies;
        yield classObj.save();
    });
};
ClassSchema.statics.updateBaseEquipment = function (classId, newBaseEquipment) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        classObj.baseEquipment = newBaseEquipment;
        yield classObj.save();
    });
};
ClassSchema.statics.deleteClass = function (classId) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        yield classObj.deleteOne();
    });
};
ClassSchema.statics.updateClass = function (classId, newClass) {
    return __awaiter(this, void 0, void 0, function* () {
        const classObj = yield this.findById(classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        for (const key in newClass) {
            if (key !== '_id' && key !== '__v') {
                classObj[key] = newClass[key];
            }
        }
        yield classObj.save();
    });
};
const ClassModel = mongoose_1.default.model('Class', ClassSchema);
exports.default = ClassModel;
