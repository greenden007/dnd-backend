import mongoose from 'mongoose';

const subclassSchema = new mongoose.Schema({
    subclassName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    features: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature',
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

subclassSchema.statics.create = async function (subclassData: any) {
    const subclass = new this(subclassData);
    await subclass.save();
    return subclass;
};

subclassSchema.statics.updateSubclass = async function (subclassId: any, updatedData: any) {
    const subclass = await this.findById(subclassId);
    if (!subclass) {
        throw new Error('Subclass not found');
    }
    for (const key in updatedData) {
        if (key !== '_id' && key !== '__v') {
            subclass[key] = updatedData[key];
        }
    }
    await subclass.save();
    return subclass;
};

subclassSchema.statics.deleteSubclass = async function (subclassId: any) {
    const subclass = await this.findById(subclassId);
    if (!subclass) {
        throw new Error('Subclass not found');
    }
    await subclass.deleteOne();
};

const SubclassModel = mongoose.model('SubClass', subclassSchema);
export default SubclassModel;
