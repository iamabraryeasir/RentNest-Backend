import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUserUpdateStatusPayload {
    status: UserStatus;
}

export interface IUserUpdateRolePayload {
    role: Role;
}
