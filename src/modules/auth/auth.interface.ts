import { Role } from "../../../generated/prisma/enums";

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: typeof Role.TENANT | typeof Role.LANDLORD;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}
