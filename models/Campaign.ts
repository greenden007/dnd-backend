import mongoose from 'mongoose';

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
    players: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    }
});

// Fix: Added the equals sign for the static method
CampaignSchema.statics.create = async function(campaignData: any) {
    const campaign = new this(campaignData);
    await campaign.save();
    return campaign;
};

CampaignSchema.statics.addCharacter = async function(campaignId: string, characterId: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.characters.push(characterId);
    await campaign.save();
};

CampaignSchema.statics.removeCharacter = async function(campaignId: string, characterId: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.characters = campaign.characters.filter((id: any) => id.toString() !== characterId.toString());
    await campaign.save();
};

CampaignSchema.statics.addPlayer = async function(campaignId: string, playerId: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.players.push(playerId);
    await campaign.save();
}

CampaignSchema.statics.removePlayer = async function(campaignId: string, playerId: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    // Assuming playerId is passed as a parameter, but not used here
    campaign.players = campaign.players.filter((id: any) => id.toString() !== playerId.toString());
    await campaign.save();
}

CampaignSchema.statics.updateDescription = async function(campaignId: string, newDescription: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.description = newDescription;
    await campaign.save();
};

CampaignSchema.statics.updateName = async function(campaignId: string, newName: string): Promise<void> {
    const campaign = await this.findById(campaignId);
    if (!campaign) {
        throw new Error('Campaign not found');
    }
    campaign.name = newName;
    await campaign.save();
};

CampaignSchema.statics.deleteCampaign = async function(campaignId: string): Promise<void> {
    // Fix: Updated to use findByIdAndDelete instead of remove()
    const result = await this.findByIdAndDelete(campaignId);
    if (!result) {
        throw new Error('Campaign not found');
    }
};

const CampaignModel = mongoose.model('Campaign', CampaignSchema);
// Fix: Use ES module export syntax for TypeScript
export default CampaignModel;