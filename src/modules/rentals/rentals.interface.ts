import { RentalRequestStatus } from "../../../generated/prisma/enums";

export interface ICreateRentalRequestPayload {
    propertyId: string;
    requestedMoveIn: string | Date;
    message?: string;
}

export interface IUpdateRentalRequestStatusPayload {
    status: RentalRequestStatus;
}
