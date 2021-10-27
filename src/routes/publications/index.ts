import express from 'express';

import { ZodError } from 'zod';
import Logger from '../../common/logger';
import * as error from '../../common/errors';
import Submission from '../../models/Submission';
import {
    ISubmissionPostRequestSchema,
    ISubmissionPostRequest,
} from '../../validators/submission';

const router = express.Router();

router.get("/:title", async (req, res) => {
    const { title } = req.params;

    const submission = await Submission.findOne({ title }).exec();
    if (!submission) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_SUBMISSION,
        });
    }

    return res.status(200).json({
        revision: submission.revision,
        owner: submission.owner,
        title: submission.title,
        introduction: submission.introduction,
        collaborators: submission.collaborators
    });
});

router.post("/submit", async (req, res) => {
    let response: ISubmissionPostRequest;

    try {
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
    
    const { title } = response;
    
    // Check if the title is already in use.
    const existingSubmission = await Submission.findOne({ title }).exec();
    if (existingSubmission) {
        return res.status(409).json({
            status: false,
            message: error.SUBMISSION_FAILED,
            extra: error.TITLE_EXISTS,
        });
    }

    const newSubmission = new Submission(response);
    try {
        const savedSubmission = await newSubmission.save();

        return res.status(201).json({
            status: true,
            message: 'Successfully submitted new publication.',
            submission: response
        })
    } catch (e) {
        Logger.error(e);

        return res.status(500).json({
            status: false,
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

})

export default router;
