const utils = require('./utilities')

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
    }
});

// Spin-off race: creates a spin off race/subrace from an existing race
// Use defaults for any of the parameters that are not being changed
RaceSchema.statics.createSpinOff = async function (existingRace: any, name: any, statsIncrease: any, speed: any, size: any, languages: any, features: any) {
    const newRace = new RaceSchema({
        name: name,
        statsIncrease: utils.addStatBlockNewBlock(existingRace.statsIncrease, statsIncrease),
        speed: speed || existingRace.speed,
        size: size || existingRace.size,
        languages: languages || existingRace.languages,
        features: features || existingRace.features,
    })

    await newRace.save();
}

RaceSchema.statics.updateStats = async function (raceId: any, statsIncrease: any) {
    const race = await this.findById(raceId);
    utils.addStatBlock(race.statsIncrease, statsIncrease);
    await race.save();
};

RaceSchema.statics.updateSpeed = async function (raceId: any, speed: Number) {
    const race = await this.findById(raceId);
    race.speed = speed;
    await race.save();
}

RaceSchema.statics.updateSize = async function (raceId: any, size: String) {
    const race = await this.findById(raceId);
    if (size !== 'small' && size !== 'medium' && size !== 'large') {
        throw new Error('Invalid size');
    }
    race.size = size;
    await race.save();
};

RaceSchema.statics.updateLanguages = async function (raceId: any, languages: [String]) {
    const race = await this.findById(raceId);
    race.languages = languages;
    await race.save();
}

RaceSchema.statics.updateFeatures = async function (raceId: any, features: [String]) {
    const race = await this.findById(raceId);
    race.features = features;
    await race.save();
}

RaceSchema.statics.deleteRace = async function (raceId: any) {
    const race = await this.findById(raceId);
    await race.remove();
}

const RaceModel = mongoose.model("Race", RaceSchema);
module.exports = RaceModel;
