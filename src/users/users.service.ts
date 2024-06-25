import { Injectable, NotFoundException } from "@nestjs/common";
import { User, UserDocument } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserType } from "src/shared/shared.enum";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async getOneByUsername(username: string): Promise<UserDocument> {
        return this.userModel.findOne({ username }).exec();
    }

    async getOneByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email }).exec();
    }

    async createAdminUser(
        email: string,
        password: string
    ): Promise<UserDocument> {
        const user = new this.userModel({
            email,
            username: email,
            password: await bcrypt.hash(password, await bcrypt.genSalt()),
            userType: UserType.ADMIN,
        });
        return user.save();
    }

    async createSessionForUser(
        _id: string,
        nonce: string
    ): Promise<UserDocument> {
        const current = new Date();
        const user = await this.userModel.findById(_id).exec();
        if (!user) throw new NotFoundException("User not found");

        // Can limit sessions to a set number by deleting older ones
        user.sessions.push({
            nonce,
            lastAccessedAt: current,
            createdAt: current,
        });
        return user.save();
    }

    async updateSessionForUser(
        _id: string,
        nonce: string
    ): Promise<UserDocument> {
        const current = new Date();

        const user = await this.userModel.findOneAndUpdate(
            {
                _id,
                "sessions.nonce": nonce,
            },
            {
                $set: {
                    "sessions.$.lastAccessedAt": current,
                },
            }
        );
        if (!user) throw new NotFoundException("User not found");
        return user;
    }
}
