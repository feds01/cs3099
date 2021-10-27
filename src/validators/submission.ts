import mongoose from 'mongoose';
import { z } from 'zod';

const ObjectIdSchema = z.string().refine(mongoose.Types.ObjectId.isValid, { message: "Not a valid object id" })

export const ISubmissionPostRequestSchema = z.object({
        revision: z.string().nonempty(),
        owner: ObjectIdSchema,
        title: z.string().nonempty(),
        introduction: z.string().nonempty(),
        collaborators: z.array(ObjectIdSchema),
});
    

export type ISubmissionPostRequest = z.infer<typeof ISubmissionPostRequestSchema>;
