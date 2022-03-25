import assert from 'assert';
import mongoose from 'mongoose';

import Logger from '../../common/logger';
import Publication, { AugmentedPublicationDocument } from '../../models/Publication';
import { AugmentedUserDocument } from '../../models/User';
import { ResponseError, ResponseErrorSummary } from '../../transformers/error';
import { expr } from '../../utils/expr';
import { SgPublication, SgUserId } from '../../validators/sg';
import { UserImportStatus, importUser } from './user';

/** Type representing the return status of @see importPublication */
export type PublicationImportStatus =
    | {
          status: 'error';
          message: string;
          errors: ResponseErrorSummary;
      }
    | {
          status: 'ok';
          ownerId: string;
          doc: AugmentedPublicationDocument;
      };

/**
 * Type representing the status of a user import combined with the
 * relevant path of the import.
 */
type UserImportWithPath = {
    path: string;
    import: UserImportStatus;
};

/**
 * Function to import all of the relevant users within a given publication. This
 * will attempt to import all of the collaborators of the publication.
 *
 * @param publication {SgPublication} The sent over publication metadata object
 *
 * @returns A list of status objects that are returned from @see importUser with
 * the associated path of the user. For example, if the owner is being imported,
 * then the object would be `{ path: 'owner', import: ownerImportResponse }`
 */
async function importRelevantUsers(publication: SgPublication): Promise<UserImportWithPath[]> {
    const imports = [{ path: 'publication.owner', import: await importUser(publication.owner) }];

    const collaborators = new Set<SgUserId>(publication.collaborators);

    // Loop through all of the collaborators and attempt to import them....
    imports.push(
        ...(await Promise.all(
            [...collaborators].map(async (collaborator, index) => {
                return {
                    path: `publication.collaborator.${index}`,
                    import: await importUser(collaborator),
                };
            }),
        )),
    );

    return imports;
}

/**
 * Function that attempts to import an external publication. This function will
 * make requests to download information about the owner and 'import' the owner
 * along with any collaborators that need to be imported.
 *
 * @param publication {SgPublication} The sent over publication metadata object
 *
 * @returns Whether importing the publication was successful or not, if successful it returns the publication
 * document. If unsuccessful, the function returns an object that represents the error that
 * occurred.
 */
export async function importPublication(
    publication: SgPublication,
): Promise<PublicationImportStatus> {
    // So here's where it gets pretty complicated. We need to check if the publication
    // owner which is a global id exists in our external id. If it does, then we can just
    // use that owner as the owner of the publication we're about to create. Otherwise, we
    // will have to make the user in addition to making the publication.
    const users = await importRelevantUsers(publication);
    const issues: Record<string, ResponseError> = {};

    for (const entry of users) {
        if (entry.import.status === 'error') {
            issues[entry.path] = { message: entry.import.message };
        }
    }

    // We failed to import some users, so we have to abort now
    if (Object.keys(issues).length > 0) {
        return {
            status: 'error',
            message: 'Failed to import owner of publication and or collaborators',
            errors: issues,
        };
    }

    // So now that we can begin importing all of the users into the publication
    const transaction = await mongoose.startSession();

    try {
        let ownerId: string | undefined;
        const collaborators = new Set<mongoose.Types.ObjectId>();

        transaction.startTransaction();

        // We need to get the owner id and collaborators from the documents
        for (const entry of users) {
            // Check if we have to save the user, and if not just return
            // the document because we will need to use the id to create
            // the publication.
            const userDoc = (await expr(async () => {
                assert(entry.import.status === 'ok');

                if (entry.import.toSave) {
                    return await entry.import.doc.save();
                } else {
                    return entry.import.doc;
                }
            })) as unknown as AugmentedUserDocument;

            // Add the owner and the collaborators to their respective fields
            if (entry.path === 'publication.owner') {
                ownerId = userDoc._id.toString();
            } else {
                collaborators.add(userDoc._id);
            }
        }

        // Ensure that the owner is found in the relevant users
        assert(typeof ownerId !== 'undefined');

        // We have to check that the publication with 'name' and the 'ownerId' doesn't already
        // exist, otherwise this doesn't conform to our uniqueness constraints...
        const uniquenessCheck = await Publication.findOne({
            owner: ownerId,
            name: publication.name,
        }).exec(); // @@CLEANUP: technically we can circumvent this issue if the user provides a different revision?

        // If this check fails, we need to abort the operation and return the error.
        if (uniquenessCheck !== null) {
            await transaction.abortTransaction();

            return {
                status: 'error',
                message: 'Publication already exists for the owner',
                errors: {
                    'publication.name': {
                        message: 'Publication name must be unique for the owner',
                    },
                },
            };
        }

        // Create the publication with the resolved owner and collaborators
        const doc = await new Publication({
            ...publication,
            draft: false,
            current: true,
            owner: ownerId,
            collaborators: [...collaborators],
        }).save();

        await transaction.commitTransaction();

        return { status: 'ok', doc, ownerId };
    } catch (e: unknown) {
        Logger.warn('Failed to save publication documents and relevant users');

        if (e instanceof Error) {
            if (typeof e.stack !== 'undefined') {
                Logger.warn('Error Stack:\n' + e.stack);
            } else {
                Logger.warn('Error:\n' + e.message);
            }
        }

        await transaction.abortTransaction();

        return {
            status: 'error',
            message: 'Failed to save publication or relevant users',
            errors: {},
        };
    } finally {
        transaction.endSession();
    }
}
