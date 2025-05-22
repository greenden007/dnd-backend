const Campaign = mongoose.Schema({
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
