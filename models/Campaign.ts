const CampaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: 255,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    characters: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Character',
    },
})

CampaignSchema.statics.addCharacter = async function (campaignId: any, characterId: any) {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.characters.push(characterId);
    await campaign.save();
}

CampaignSchema.statics.removeCharacter = async function (campaignId: any, characterId: any) {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.characters = campaign.characters.filter((id: any) => id.toString() !== characterId.toString());
    await campaign.save();
}

CampaignSchema.statics.updateDescription = async function (campaignId: any, newDescription: any) {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.description = newDescription;
    await campaign.save();
}

CampaignSchema.statics.updateName = async function (campaignId: any, newName: any) {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.name = newName;
    await campaign.save();
}

CampaignSchema.statics.deleteCampaign = async function (campaignId: any) {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    await campaign.remove();
}

const CampaignModel = mongoose.model('Campaign', CampaignSchema);
module.exports = CampaignModel;