import mongoose, { Schema } from 'mongoose';
import * as utils from './utilities';

const zero_stats = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
}

const RaceSchema = new mongoose.Schema({
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
        type: [Schema.Types.ObjectId], // Use null for a free feature
        ref: 'Feature',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

// Spin-off race: creates a spin off race/subrace from an existing race
// Use defaults for any of the parameters that are not being changed
RaceSchema.statics.createSpinOff = async function (existingRace: string, name: string, statsIncrease?: any, speed?: number, size?: string, languages?: string[], features?: mongoose.Types.ObjectId[]) {
    try {
        const baseRace = await this.findById(existingRace);
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

        await newRace.save();
        return newRace;
    } catch (error: any) {
        throw new Error(`Failed to create spin-off race: ${error.message}`);
    }
}

RaceSchema.statics.updateRace = async function (raceId: any, newRaceDetails: any) {
    const race = await this.findById(raceId);
    if (!race) {
        throw new Error('Race not found');
    }
    for (const key in newRaceDetails) {
        if (key !== '_id' && key !== '__v') {
            race[key] = newRaceDetails[key];
        }
    }

    await race.save();
    return race;
}

RaceSchema.statics.updateStats = async function (raceId: any, statsIncrease: any) {
    const race = await this.findById(raceId);
    utils.addStatBlock(race.statsIncrease, statsIncrease);
    await race.save();
};

RaceSchema.statics.updateSpeed = async function (raceId: any, speed: number) {
    const race = await this.findById(raceId);
    if (!race) {
        throw new Error('Race not found');
    }
    race.speed = speed;
    await race.save();
    return race;
}

RaceSchema.statics.updateSize = async function (raceId: any, size: string) {
    const race = await this.findById(raceId);
    if (!race) {
        throw new Error('Race not found');
    }
    if (size !== 'small' && size !== 'medium' && size !== 'large') {
        throw new Error('Invalid size');
    }
    race.size = size;
    await race.save();
    return race;
};

RaceSchema.statics.updateLanguages = async function (raceId: any, languages: string[]) {
    const race = await this.findById(raceId);
    if (!race) {
        throw new Error('Race not found');
    }
    race.languages = languages;
    await race.save();
    return race;
}

RaceSchema.statics.updateFeatures = async function (raceId: any, features: string[]) {
    const race = await this.findById(raceId);
    if (!race) {
        throw new Error('Race not found');
    }
    race.features = features;
    await race.save();
    return race;
}

RaceSchema.statics.deleteRace = async function (raceId: any) {
    const race = await this.findById(raceId);
    if (!race) {
        throw new Error('Race not found');
    }
    await race.deleteOne();
}

RaceSchema.statics.create = async function (raceInfo: any) {
    const race = new this(raceInfo);
    await race.save();
    return race;
}

const RaceModel = mongoose.model("Race", RaceSchema);
export default RaceModel;
