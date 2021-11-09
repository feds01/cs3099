import React, { ReactElement } from 'react';
import { z } from 'zod';
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Autocomplete, Box, Divider, TextField, Typography } from '@mui/material';
import { usePostPublication } from '../../lib/api/publications/publications';
import { useAuth } from '../../hooks/auth';

type Props = {};

const CreatePublicationSchema = z.object({
    name: z.string().max(32),
    title: z.string().max(32),
    introduction: z.string(),
    revision: z.string().max(200).optional(),
    collaborators: z.array(z.string()),
});

type CreatePublication = z.infer<typeof CreatePublicationSchema>;

export default function CreatePublicationForm({}: Props): ReactElement {
    const auth = useAuth();

    const createPublicationQuery = usePostPublication();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreatePublication>({
        resolver: zodResolver(CreatePublicationSchema),
        defaultValues: {
            collaborators: [],
        },
    });

    const { isLoading, isError, data: response, error, mutateAsync } = usePostPublication();
    // const onSubmit: SubmitHandler<CreatePublication> = async (data) => await mutateAsync({ data });
    const onSubmit: SubmitHandler<CreatePublication> = async (data) => console.log(data);

    return (
        <form style={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
            <Typography variant={'h4'}>Create Publication</Typography>
            <Divider />
            <Typography>Upload new publication to Iamus</Typography>
            <Grid item xs={12} sm={7}>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                    Publication name Name
                </Typography>
                <Typography variant={'body2'}>This will be used to publicly identify the publication.</Typography>
                <Grid item xs={12} sm={8} md={6}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                {...(errors.name && {
                                    error: true,
                                    helperText: errors.name.message,
                                })}
                                InputProps={{
                                    startAdornment: <Box>{auth.session.username}</Box>,
                                }}
                                size="small"
                                fullWidth
                                sx={{
                                    marginTop: 1,
                                    marginBottom: 1,
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} sm={7}>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                    Publication Title
                </Typography>
                <Grid item xs={12} sm={8} md={6}>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                {...(errors.title && {
                                    error: true,
                                    helperText: errors.title.message,
                                })}
                                size="small"
                                fullWidth
                                sx={{
                                    marginTop: 1,
                                    marginBottom: 1,
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} sm={7}>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                    Introduction
                </Typography>
                <Grid item xs={12} sm={8} md={6}>
                    <Controller
                        name="introduction"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                helperText={'Publication introduction'}
                                {...(errors.introduction && {
                                    error: true,
                                    helperText: errors.introduction.message,
                                })}
                                size="small"
                                multiline
                                rows={4}
                                fullWidth
                                sx={{
                                    marginTop: 1,
                                    marginBottom: 1,
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} sm={7}>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                    Revision
                </Typography>
                <Grid item xs={12} sm={8} md={6}>
                    <Controller
                        name="revision"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                {...(errors.revision && {
                                    error: true,
                                    helperText: errors.revision.message,
                                })}
                                size="small"
                                fullWidth
                                sx={{
                                    marginTop: 1,
                                    marginBottom: 1,
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} sm={7}>
                <Typography variant={'body1'} sx={{ fontWeight: 'bold' }}>
                    Collaborators
                </Typography>
                <Grid item xs={12} sm={8} md={6}>
                    <Controller
                        name="collaborators"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                multiple
                                options={[]} // @@TODO: convert this to a user search input
                                freeSolo
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        {...field}
                                        {...(errors.revision && {
                                            error: true,
                                            helperText: errors.revision.message,
                                        })}
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>
            </Grid>
        </form>
    );
}
