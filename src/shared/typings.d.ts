import mongoose from "mongoose";
import { Payload } from "src/auth/payload.interface";
import { ClinicDocument } from "src/clinics/schemas/clinic.schema";

export type UserRequest = Request & { payload: Payload; token: string };
export type ClinicRequest = UserRequest & { clinic: ClinicDocument };
export type ObjectId = mongoose.Types.ObjectId | string;
export type ObjectList<T> = { data: Array<T>; count?: number };
export type AuthTokens = { accessToken: string; refreshToken: string };
