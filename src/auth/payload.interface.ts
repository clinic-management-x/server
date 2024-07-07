import { ObjectId } from "src/shared/typings";

export interface Payload {
    sub: ObjectId;
    username: string;
    email: string;
    nonce: string;
    iat?: number;
    exp?: number;
}
