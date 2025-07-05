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
const mongoose_1 = __importStar(require("mongoose"));
const utils = __importStar(require("./utilities"));
const zero_stats = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
};
const RaceSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    statsIncrease: {
        type: utils.statBlock,
        default: zero_stats,
    },
    speed: {
        type: Number,
        default: 30,
    },
    size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
    },
    languages: {
        type: [String], // Use * for a free language
        default: [],
    },
    features: {
        type: [mongoose_1.Schema.Types.ObjectId], // Use null for a free feature
        ref: 'Feature',
    },
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    }
});
// Spin-off race: creates a spin off race/subrace from an existing race
// Use defaults for any of the parameters that are not being changed
RaceSchema.statics.createSpinOff = function (existingRace, name, statsIncrease, speed, size, languages, features) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseRace = yield this.findById(existingRace);
            if (!baseRace) {
                throw new Error('Base race not found');
            }
            const newRace = new this({
                name: name,
                statsIncrease: statsIncrease || baseRace.statsIncrease,
                speed: speed || baseRace.speed,
                size: size || baseRace.size,
                languages: languages || [...baseRace.languages],
                features: features || [...baseRace.features],
                creator: baseRace.creator
            });
            yield newRace.save();
            return newRace;
        }
        catch (error) {
            throw new Error(`Failed to create spin-off race: ${error.message}`);
        }
    });
};
RaceSchema.statics.updateRace = function (raceId, newRaceDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        if (!race) {
            throw new Error('Race not found');
        }
        for (const key in newRaceDetails) {
            if (key !== '_id' && key !== '__v') {
                race[key] = newRaceDetails[key];
            }
        }
        yield race.save();
        return race;
    });
};
RaceSchema.statics.updateStats = function (raceId, statsIncrease) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        utils.addStatBlock(race.statsIncrease, statsIncrease);
        yield race.save();
    });
};
RaceSchema.statics.updateSpeed = function (raceId, speed) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        if (!race) {
            throw new Error('Race not found');
        }
        race.speed = speed;
        yield race.save();
        return race;
    });
};
RaceSchema.statics.updateSize = function (raceId, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        if (!race) {
            throw new Error('Race not found');
        }
        if (size !== 'small' && size !== 'medium' && size !== 'large') {
            throw new Error('Invalid size');
        }
        race.size = size;
        yield race.save();
        return race;
    });
};
RaceSchema.statics.updateLanguages = function (raceId, languages) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        if (!race) {
            throw new Error('Race not found');
        }
        race.languages = languages;
        yield race.save();
        return race;
    });
};
RaceSchema.statics.updateFeatures = function (raceId, features) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        if (!race) {
            throw new Error('Race not found');
        }
        race.features = features;
        yield race.save();
        return race;
    });
};
RaceSchema.statics.deleteRace = function (raceId) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = yield this.findById(raceId);
        if (!race) {
            throw new Error('Race not found');
        }
        yield race.deleteOne();
    });
};
RaceSchema.statics.create = function (raceInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const race = new this(raceInfo);
        yield race.save();
        return race;
    });
};
const RaceModel = mongoose_1.default.model("Race", RaceSchema);
exports.default = RaceModel;
