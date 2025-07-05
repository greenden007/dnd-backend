import mongoose, { Schema } from 'mongoose';

const ClassSchema = new mongoose.Schema({
    lvlUnlocks: {
        type: Map,
        of: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Feature',
        }
    },
    hitDie: {
        type: Number,
        required: true,
    },
    armorProficiencies: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Armor',
    },
    weaponProficiencies: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Weapon',
    },
    toolProficiencies: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Item',
    },
    savingThrows: {
        type: [String],
    },
    skillProficiencies: {
        type: [String],
    },
    baseEquipment: {
        type: [[mongoose.Schema.Types.ObjectId]],
        ref: 'Item',
    },
    multiclassing: {
        statRequirements: {
            type: [[String]], // [["str", "dex"]] for either or, ["str", "dex", "con"] for each >= 13
            required: true,
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

ClassSchema.statics.create = async function(campaignData: any) {
    const classObj = new this(campaignData);
    await classObj.save();
    return classObj;
}

ClassSchema.statics.addLevelUnlock = async function (classId: any, level: number, featureId: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    if (!classObj.lvlUnlocks.has(level.toString())) {
        classObj.lvlUnlocks.set(level.toString(), []);
    }
    classObj.lvlUnlocks.get(level.toString()).push(featureId);
    await classObj.save();
    return classObj;
}

ClassSchema.statics.removeLevelUnlock = async function (classId: any, level: number, featureId: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    if (classObj.lvlUnlocks.has(level.toString())) {
        classObj.lvlUnlocks.set(
            level.toString(),
            classObj.lvlUnlocks.get(level.toString()).filter((id: any) => id.toString() !== featureId.toString())
        );
        await classObj.save();
        return classObj;
    } else {
        throw new Error('Level unlock not found');
    }
}

ClassSchema.statics.updateHitDie = async function (classId: any, newHitDie: number) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.hitDie = newHitDie;
    await classObj.save();
    return classObj;
}

ClassSchema.statics.updateArmorProficiencies = async function (classId: any, newArmorProficiencies: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.armorProficiencies = newArmorProficiencies;
    await classObj.save();
}

ClassSchema.statics.updateWeaponProficiencies = async function (classId: any, newWeaponProficiencies: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.weaponProficiencies = newWeaponProficiencies;
    await classObj.save();
}

ClassSchema.statics.updateToolProficiencies = async function (classId: any, newToolProficiencies: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.toolProficiencies = newToolProficiencies;
    await classObj.save();
}

ClassSchema.statics.updateSavingThrows = async function (classId: any, newSavingThrows: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.savingThrows = newSavingThrows;
    await classObj.save();
}

ClassSchema.statics.updateSkillProficiencies = async function (classId: any, newSkillProficiencies: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.skillProficiencies = newSkillProficiencies;
    await classObj.save();
}

ClassSchema.statics.updateBaseEquipment = async function (classId: any, newBaseEquipment: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    classObj.baseEquipment = newBaseEquipment;
    await classObj.save();
}

ClassSchema.statics.deleteClass = async function (classId: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    await classObj.deleteOne();
}

ClassSchema.statics.updateClass = async function (classId: any, newClass: any) {
    const classObj = await this.findById(classId);
    if (!classObj) {
        throw new Error('Class not found');
    }
    for (const key in newClass) {
        if (key !== '_id' && key !== '__v') {
            classObj[key] = newClass[key];
        }
    }
    await classObj.save();
}

const ClassModel = mongoose.model('Class', ClassSchema);
export default ClassModel;
