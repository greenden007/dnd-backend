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
const bcrypt = require('bcryptjs');
const userSchema = new mongoose_1.default.Schema({
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
    isBetaTester: {
        type: Boolean,
        default: false
    },
    betaCodeUsed: {
        type: String,
        default: null
    },
    characters: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Character',
        }],
    campaigns: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Campaign',
        }]
});
userSchema.statics.updateUsername = function (userId, newUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.username = newUsername;
        yield user.save();
    });
};
userSchema.statics.updatePassword = function (userId, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const salt = yield bcrypt.genSalt(10);
        user.password = yield bcrypt.hash(newPassword, salt);
        yield user.save();
    });
};
userSchema.statics.updateEmail = function (userId, newEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.email = newEmail;
        yield user.save();
    });
};
userSchema.statics.resetPassword = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const email = user.email;
        // TODO: send email with reset link
    });
};
userSchema.statics.deleteUser = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        yield user.deleteOne();
    });
};
const UserModel = mongoose_1.default.model('User', userSchema);
// Export for both CommonJS and ES modules
exports.default = UserModel;
