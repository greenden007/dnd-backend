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
const CampaignSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    characters: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: 'Character',
    },
    players: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: 'User',
    }
});
// Fix: Added the equals sign for the static method
CampaignSchema.statics.create = function (campaignData) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = new this(campaignData);
        yield campaign.save();
        return campaign;
    });
};
CampaignSchema.statics.addCharacter = function (campaignId, characterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = yield this.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        campaign.characters.push(characterId);
        yield campaign.save();
    });
};
CampaignSchema.statics.removeCharacter = function (campaignId, characterId) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = yield this.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        campaign.characters = campaign.characters.filter((id) => id.toString() !== characterId.toString());
        yield campaign.save();
    });
};
CampaignSchema.statics.addPlayer = function (campaignId, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = yield this.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        campaign.players.push(playerId);
        yield campaign.save();
    });
};
CampaignSchema.statics.removePlayer = function (campaignId, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = yield this.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        // Assuming playerId is passed as a parameter, but not used here
        campaign.players = campaign.players.filter((id) => id.toString() !== playerId.toString());
        yield campaign.save();
    });
};
CampaignSchema.statics.updateDescription = function (campaignId, newDescription) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = yield this.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        campaign.description = newDescription;
        yield campaign.save();
    });
};
CampaignSchema.statics.updateName = function (campaignId, newName) {
    return __awaiter(this, void 0, void 0, function* () {
        const campaign = yield this.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        campaign.name = newName;
        yield campaign.save();
    });
};
CampaignSchema.statics.deleteCampaign = function (campaignId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fix: Updated to use findByIdAndDelete instead of remove()
        const result = yield this.findByIdAndDelete(campaignId);
        if (!result) {
            throw new Error('Campaign not found');
        }
    });
};
const CampaignModel = mongoose_1.default.model('Campaign', CampaignSchema);
// Fix: Use ES module export syntax for TypeScript
exports.default = CampaignModel;
