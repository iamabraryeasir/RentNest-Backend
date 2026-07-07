import { UserStatus } from "../../../generated/prisma/enums";

export interface IUserUpdateStatusPayload {
    status: UserStatus;
}
