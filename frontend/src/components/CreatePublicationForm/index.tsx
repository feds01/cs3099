import React, { ReactElement} from "react";
import { z } from 'zod';
import Grid from '@mui/material/Grid';
import { Divider, TextField, Typography } from "@mui/material";
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePostPublication } from "../../lib/api/publications/publications";

type Props = {};

const CreatePublicationSchema = z.object({
    name: z.string().max(32),
    title: z.string().max(32),
    introduction: z.string(),
    revision: z.string().max(200).optional(),
    collaborators: z.array(z.string()).optional(),
    tags: z.string().max(32),
});

type CreatePublication = z.infer<typeof CreatePublicationSchema>;

export default function CreatePublicationForm({ }: Props): ReactElement {
    const createPublicationQuery = usePostPublication();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreatePublication>({
        resolver: zodResolver(CreatePublicationSchema),
    });

    // This is the query to the backend
    const { isLoading, isError, data: response, error, mutateAsync } = usePostPublication();
    
    // This function will be called once the form is ready to submit
    // const onSubmit: SubmitHandler<CreatePublication> = async (data) =>
    //     await mutateAsync({ data });

    return (
        <form style={{ width: '100%'}} /*onSubmit={handleSubmit(onSubmit)}*/>
            <Typography variant={'h4'}>Create Publication</Typography>
            <Divider />
                <Typography>Upload new publication to Iamus.</Typography>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Name
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            size="small"
                            fullWidth
                            sx={{
                                marginTop: 1,
                                marginBottom: 1,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Publication Title
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            size="small"
                            fullWidth
                            sx={{
                                marginTop: 1,
                                marginBottom: 1,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Introduction
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            size="medium"
                            fullWidth
                            sx={{
                                marginTop: 1,
                                marginBottom: 1,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Revision
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            size="small"
                            fullWidth
                            sx={{
                                marginTop: 1,
                                marginBottom: 1,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Collaborators
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            size="small"
                            fullWidth
                            sx={{
                                marginTop: 1,
                                marginBottom: 1,
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={7}>
                    <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                        Tags
                    </Typography>
                    <Grid item xs={12} sm={8} md={6}>
                        <TextField
                            size="small"
                            fullWidth
                            sx={{
                                marginTop: 1,
                                marginBottom: 1,
                            }}
                        />
                    </Grid>
                </Grid>
        </form>
    )
}