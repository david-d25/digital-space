import {atom} from "recoil";
import ConfigService from "../service/ConfigService";

export const servicesState = atom({
    key: 'servicesState',
    default: {
        configService: new ConfigService()
    }
});