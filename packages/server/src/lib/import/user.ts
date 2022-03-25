import Logger from '../../common/logger';
import User, { IUserDocument } from '../../models/User';
import { ResponseErrorSummary } from '../../transformers/error';
import { convertSgId, transformSgUserToInternal } from '../../transformers/sg';
import { SgUserId, SgUserSchema } from '../../validators/sg';
import { makeRequest } from './../communication/fetch';

const GROUP_URI_MAP: Record<string, string> = {
    t06: 'https://cs3099user06.host.cs.st-andrews.ac.uk/',
    t12: 'https://cs3099user12.host.cs.st-andrews.ac.uk/',
    t15: 'https://cs3099user15.host.cs.st-andrews.ac.uk/',
    t21: 'https://cs3099user21.host.cs.st-andrews.ac.uk/',
    t24: 'https://cs3099user24.host.cs.st-andrews.ac.uk/',
    t27: 'https://cs3099user27.host.cs.st-andrews.ac.uk/',
};

export type UserImportStatus =
    | {
          status: 'error';
          message: string;
          error: ResponseErrorSummary;
      }
    | {
          status: 'ok';
          doc: IUserDocument;
          toSave: boolean;
      };

/**
 * Function that attempts to import an external user specified by an an @see {SgUserId}.
 * If the user already exists in the database, it returns the current user, otherwise it
 * attempts to contact the external service and get the data for the specified user by
 * id and group id.
 *
 * @param externalUserId {SgUserId} The id of the user and the id of the group the user is from.
 * @returns Whether importing the user was successful or not, if successful it returns the user
 * document. If unsuccessful, the function returns an object that represents the error that
 * occurred.
 */
export async function importUser(externalUserId: SgUserId): Promise<UserImportStatus> {
    const externalId = convertSgId(externalUserId);
    const user = await User.findOne({ externalId }).exec();
    if (user) {
        return {
            status: 'ok',
            doc: user,
            toSave: false,
        };
    }

    // get the correct address based on the owner.group
    const userFrom = GROUP_URI_MAP[externalUserId.group];

    if (typeof userFrom === 'undefined') {
        Logger.warn('User group id was invalid');
        return {
            status: 'error',
            message: 'Cannot import a user from a non-existant group',
            error: {
                importId: { message: convertSgId(externalUserId) },
            },
        };
    }

    // Make a request to the external service in order to import the external user...
    const userData = await makeRequest(
        userFrom,
        `/api/sg/users/${externalUserId.id}:${externalUserId.group}`,
        SgUserSchema,
    );

    if (userData.status === 'error') {
        Logger.warn(
            `Couldn't import user from external service with id ${externalId}:\n${JSON.stringify(
                userData.errors,
            )}`,
        );
        return {
            status: 'error',
            message: `request failed due to: ${userData.type}. Cannot import user from external service.`,
            error: userData.errors,
        };
    }

    const userDoc = await transformSgUserToInternal(userData.response);

    return {
        status: 'ok',
        doc: new User(userDoc),
        toSave: true,
    };
}
