import mongoose from 'mongoose';
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    characters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
    }],
    campaigns: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
    }]
});

userSchema.statics.updateUsername = async function(userId: any, newUsername: any) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.username = newUsername;
    await user.save();
}

userSchema.statics.updatePassword = async function(userId: any, newPassword: any) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
}

userSchema.statics.updateEmail = async function(userId: any, newEmail: any) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.email = newEmail;
    await user.save();
}

userSchema.statics.resetPassword = async function(userId: any) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const email = user.email;
    // TODO: send email with reset link
}

userSchema.statics.deleteUser = async function(userId: any) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    await user.deleteOne();
}

const UserModel = mongoose.model('User', userSchema);

// Export for both CommonJS and ES modules
export default UserModel;
