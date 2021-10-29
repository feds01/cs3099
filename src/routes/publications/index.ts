import express from 'express';

import { ZodError } from 'zod';
import User from '../../models/User';
import Logger from '../../common/logger';
import * as error from '../../common/errors';
import Submission from '../../models/Submission';
import {
    ISubmissionPostRequestSchema,
    ISubmissionPostRequest,
} from '../../validators/submission';

const router = express.Router();

// Get all publications
router.get("/", async (req, res) => {
    // TODO: pagination
    const publications = await Submission.find().limit(50);
    return res.status(200).json({
        status: true,
        submissions: publications
    });
});


// Get a list of all publications with a specific title or username
// TODO: also support username
router.get("/:title", async (req, res) => {
    const { title } = req.params;

    const submissions = await Submission.find({ title }).exec();
    if (!submissions) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_SUBMISSION,
        });
    }

    return res.status(200).json({
        status: true,
        submissions,
    });
});

router.post("/", async (req, res) => {
    let response: ISubmissionPostRequest;

    try {
        // it checks if all submitted names exists in User table
        response = await ISubmissionPostRequestSchema.parseAsync(req.body);
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: false,
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }
        Logger.error(e);

        return res.status(500).json({
            status: false,
            message: error.INTERNAL_SERVER_ERROR,
        });
    }
    
    const { owner, title, collaborators } = response;

    // owner must exists after parsing req.body
    const ownerDoc = await User.findOne({ username: owner }).exec();
    
    // Check if the title is already in use.
    const existingSubmission = await Submission.count({ owner: ownerDoc?.id, title: title }).exec();
    if (existingSubmission > 0) {
        return res.status(400).json({
            status: false,
            message: error.SUBMISSION_FAILED,
            extra: error.TITLE_EXISTS,
        });
    }

    // Find all corresponding ids of each collaborators' username
    const collaboratorDocs = await User.find({ username: { $in: collaborators }}).exec();
    if (collaboratorDocs.length < collaborators.length) {
        let namesFound: string[] = collaboratorDocs.map(doc => doc.username);
        let missingNames: string[] = collaborators.filter(name => !namesFound.includes(name));
        return res.status(404).json({
           status: false,
           message: error.NON_EXISTENT_USER,
           extra: missingNames, 
        });
    }

    const newSubmission = new Submission({
        revision: response.revision,
        title: response.title,
        introduction: response.introduction,
        collaborators: collaboratorDocs.map((doc) => doc.id),
        owner: ownerDoc?.id,
    });

    try {
        const savedSubmission = await newSubmission.save();

        return res.status(201).json({
            status: true,
            message: 'Successfully submitted new publication.',
            submission: savedSubmission,
        })
    } catch (e) {
        Logger.error(e);

        return res.status(500).json({
            status: false,
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

});

export default router;
