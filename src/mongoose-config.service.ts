import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    MongooseModuleOptions,
    MongooseOptionsFactory,
} from "@nestjs/mongoose";
import { MONGO_URL } from "./shared/constants";

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
    constructor(private configService: ConfigService) {}

    createMongooseOptions(): MongooseModuleOptions {
        return {
            uri: this.configService.get<string>(MONGO_URL),
        };
    }
}
