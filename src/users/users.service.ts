import { Injectable, NotFoundException } from "@nestjs/common";
import { User, UserDocument } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserType } from "src/shared/shared.enum";
import * as bcrypt from "bcrypt";
import { ObjectId } from "src/shared/typings";
import * as dayjs from "dayjs";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async getOneByUsername(username: string): Promise<UserDocument> {
        return this.userModel.findOne({ username }).exec();
    }

    async getOneByEmail(email: string): Promise<UserDocument> {
        return this.userModel.findOne({ email }).exec();
    }

    async getOneById(_id: ObjectId): Promise<UserDocument> {
        return this.userModel.findById(_id).exec();
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
        _id: ObjectId,
        nonce: string
    ): Promise<UserDocument> {
        const current = new Date();
        const user = await this.userModel.findById(_id).exec();
        if (!user) throw new NotFoundException("User not found");

        user.sessions.push({
            nonce,
            lastAccessedAt: current,
            lastRefreshedAt: current,
            createdAt: current,
        });
        return user.save();
    }

    async accessSessionForUser(
        _id: ObjectId,
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
        if (!user) throw new NotFoundException("Session not found");
        return user;
    }

    async refreshSessionForUser(
        _id: ObjectId,
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
                    "sessions.$.lastRefreshedAt": current,
                    "sessions.$.lastAccessedAt": current,
                },
            }
        );
        if (!user) throw new NotFoundException("Session not found");
        return user;
    }

    async clearExpiredSessionsForUser(_id: ObjectId): Promise<UserDocument> {
        const oneMonthAgo = dayjs().subtract(1, "month").toDate();
        const user = await this.userModel.findOneAndUpdate(
            {
                _id,
            },
            {
                $pull: {
                    sessions: {
                        lastRefreshedAt: { $lt: oneMonthAgo },
                    },
                },
            }
        );
        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    async removeSessionForUser(
        _id: ObjectId,
        nonce: string
    ): Promise<UserDocument> {
        const user = await this.userModel.findOneAndUpdate(
            { _id },
            {
                $pull: { sessions: { nonce } },
            }
        );
        if (!user) throw new NotFoundException("User not found");
        return user;
    }
}
