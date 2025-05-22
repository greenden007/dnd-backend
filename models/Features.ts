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
    }
});

FeaturesSchema.statics.updateFeaturesSchema = async (featureId: any, featureName: any, description: any, requirements: any, statBonus: any) => {
    const feature = await FeaturesModel.findById(featureId);
    if (!feature) {
        throw new Error('Feature not found');
    }
    feature.featureName = featureName || feature.featureName;
    feature.description = description || feature.description;
    feature.requirements = requirements || feature.requirements;
    utils.addStatBlock(feature.statBonus, statBonus);
    await feature.save();
}

const FeaturesModel = mongoose.model('Feature', FeaturesSchema);
module.exports = FeaturesModel;
