import mongoose from 'mongoose';
import * as utils from './utilities';

const zero_stats = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
};

const FeaturesSchema = new mongoose.Schema({
    featureName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: {
        type: String,
        required: true
    },
    statBonus: {
        type: utils.statBlock,
        default: zero_stats,
    },
    rolls: {
        type: [String],
        default: []
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

FeaturesSchema.statics.updateFeaturesSchema = async function(featureId: any, featureName: any, description: any, requirements: any, statBonus: any) {
    const feature = await this.findById(featureId);
    if (!feature) {
        throw new Error('Feature not found');
    }
    feature.featureName = featureName || feature.featureName;
    feature.description = description || feature.description;
    feature.requirements = requirements || feature.requirements;

    // Only apply statBonus if it's provided, and create a copy to avoid mutation
    if (statBonus) {
        feature.statBonus = { ...feature.statBonus };
        utils.addStatBlock(feature.statBonus, statBonus);
    }

    await feature.save();
    return feature;
}

FeaturesSchema.statics.deleteFeaturesSchema = async function(featureId: any) {
    const feature = await this.findById(featureId);
    if (!feature) {
        throw new Error('Feature not found');
    }

    await feature.deleteOne();
    return { message: 'Feature successfully deleted' };
}

FeaturesSchema.statics.create = async function(featureData: any) {
    const feature = new this(featureData);
    await feature.save();
    return feature;
}

const FeaturesModel = mongoose.model('Feature', FeaturesSchema);
export default FeaturesModel;
