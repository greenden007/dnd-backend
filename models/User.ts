import mongoose, { Document, Model, Schema } from 'mongoose';
const bcrypt = require('bcryptjs');

export interface User extends mongoose.Document {
    id?: string; // Optional for compatibility with Express.Request.user
    username: string;
    password: string;
    email: string;
    createdAt: Date;
    activeSession: string | null;
    lastLogin: Date | null;
    characters: mongoose.Types.ObjectId[];
    campaigns: mongoose.Types.ObjectId[];
}


const userSchema = new Schema<User>({
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
    activeSession: {
        type: String,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
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

userSchema.statics.updateUsername = async function(userId: string, newUsername: string) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.username = newUsername;
    await user.save();
}

userSchema.statics.updatePassword = async function(userId: string, newPassword: string) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
}

userSchema.statics.updateEmail = async function(userId: string, newEmail: string) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.email = newEmail;
    await user.save();
}

userSchema.statics.resetPassword = async function(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const email = user.email;
    // TODO: send email with reset link
}

userSchema.statics.deleteUser = async function(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    await user.deleteOne();
}

const User = mongoose.model<User>('User', userSchema);

export default User;
