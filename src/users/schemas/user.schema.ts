import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { UserType } from "src/shared/shared.enum";

const removeSensitive = (user: User) => {
    delete user.password;
    delete user.sessions;
    return user;
};

@Schema()
class Session {
    @Prop({ required: true })
    nonce: string;

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ required: true })
    lastAccessedAt: Date;

    @Prop({ required: true })
    lastRefreshedAt: Date;
}

@Schema({
    toObject: {
        transform(...[, ret]) {
            return removeSensitive(ret as User);
        },
    },
    toJSON: {
        transform(...[, ret]) {
            return removeSensitive(ret as User);
        },
    },
})
export class User {
    @Prop({ unique: true, sparse: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: UserType })
    userType: UserType;

    @Prop({
        required: (doc) => doc.userType !== UserType.ADMIN,
        type: SchemaTypes.ObjectId,
        ref: User.name,
    })
    parentUser?: Types.ObjectId;

    @Prop({ default: [] })
    sessions: Session[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
