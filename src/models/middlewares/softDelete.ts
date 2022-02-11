import mongoose from 'mongoose';

/**
 * Type to extend the default document definition to contain additional information about
 * whether or not the document is in a deleted state.
 */
export type TWithSoftDeleted = {
    isDeleted: boolean;
};

type TDocument = TWithSoftDeleted & mongoose.Document;

/**
 *
 * @param doc
 */
const setDocumentIsDeleted = async (doc: TDocument) => {
    doc.isDeleted = true;
    doc.$isDeleted(true);

    console.log('setting to delete');

    await doc.save();
};

/**
 * Register the hook for any functions that find documents to filter out
 * isDeleted' entries.
 * */
const excludeInFindQueriesIsDeleted = async function (
    this: mongoose.Query<TDocument, TDocument>,
    next: () => void,
) {
    this.where({
        $or: [{ isDeleted: { $exists: true, $eq: false } }, { isDeleted: { $exists: false } }],
    });
    next();
};

/**
 * Register the hook for any functions that aggregate documents to filter out
 * 'isDeleted' entries.
 */
const excludeInDeletedInAggregateMiddleware = async function (
    this: mongoose.Aggregate<any>,
    next: () => void,
) {
    this.pipeline().unshift({
        $match: {
            $or: [{ isDeleted: { $exists: true, $eq: false } }, { isDeleted: { $exists: false } }],
        },
    });
    next();
};

/**
 * Middleware to define for schemas that support soft deletion.
 *
 * @param schema
 */
const softDeleteMiddleware = (schema: mongoose.Schema) => {
    schema.add({
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    });

    // We want to define this middleware for all the aggregate functions
    const typesFindQueryMiddleware = [
        'count',
        'find',
        'findOne',
        'findOneAndDelete',
        'findOneAndRemove',
        'findOneAndUpdate',
        'update',
        'updateOne',
        'updateMany',
    ];
    // Register a hook for remove actions that set the 'isDeleted' field to true
    schema.pre('remove', async function (this: TDocument, next: () => void) {
        await setDocumentIsDeleted(this);
        next();
    });

    typesFindQueryMiddleware.forEach((type) => {
        schema.pre(type, excludeInFindQueriesIsDeleted);
    });

    schema.pre('aggregate', excludeInDeletedInAggregateMiddleware);
};

export default softDeleteMiddleware;
