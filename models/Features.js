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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const utils = __importStar(require("./utilities"));
const zero_stats = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
};
const FeaturesSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    }
});
FeaturesSchema.statics.updateFeaturesSchema = function (featureId, featureName, description, requirements, statBonus) {
    return __awaiter(this, void 0, void 0, function* () {
        const feature = yield this.findById(featureId);
        if (!feature) {
            throw new Error('Feature not found');
        }
        feature.featureName = featureName || feature.featureName;
        feature.description = description || feature.description;
        feature.requirements = requirements || feature.requirements;
        // Only apply statBonus if it's provided, and create a copy to avoid mutation
        if (statBonus) {
            feature.statBonus = Object.assign({}, feature.statBonus);
            utils.addStatBlock(feature.statBonus, statBonus);
        }
        yield feature.save();
        return feature;
    });
};
FeaturesSchema.statics.deleteFeaturesSchema = function (featureId) {
    return __awaiter(this, void 0, void 0, function* () {
        const feature = yield this.findById(featureId);
        if (!feature) {
            throw new Error('Feature not found');
        }
        yield feature.deleteOne();
        return { message: 'Feature successfully deleted' };
    });
};
FeaturesSchema.statics.create = function (featureData) {
    return __awaiter(this, void 0, void 0, function* () {
        const feature = new this(featureData);
        yield feature.save();
        return feature;
    });
};
const FeaturesModel = mongoose_1.default.model('Feature', FeaturesSchema);
exports.default = FeaturesModel;
