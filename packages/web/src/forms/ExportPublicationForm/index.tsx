import { usePostPublicationUsernameNameExport } from '../../lib/api/publications/publications';
import { ExportPublicationSchema, IExportPublication } from '../../validators/export';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, DialogActions, DialogContent, FormHelperText, FormLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { ReactElement } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ApiErrorResponse } from '../../lib/api/models';

interface ExportDialogProps {
    open: boolean;
    username: string;
    name: string;
    revision?: string;
    onClose: () => void;
}

const journalUrls = {
    t03: 'https://cs3099user03.host.cs.st-andrews.ac.uk/',
    t09: 'https://cs3099user09.host.cs.st-andrews.ac.uk/',
    t12: 'https://cs3099user12.host.cs.st-andrews.ac.uk/',
    t15: 'https://cs3099user15.host.cs.st-andrews.ac.uk/',
    t21: 'https://cs3099user21.host.cs.st-andrews.ac.uk/',
    t24: 'https://cs3099user24.host.cs.st-andrews.ac.uk/',
    t27: 'https://cs3099user27.host.cs.st-andrews.ac.uk/',
};

export default function ExportDialog({ username, name, revision, open, onClose }: ExportDialogProps): ReactElement {
    const exportPub = usePostPublicationUsernameNameExport();
    const notificationDispatcher = useNotificationDispatch();
    const [error, setError] = useState<ApiErrorResponse | null>(null);

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, isValid },
    } = useForm<IExportPublication>({
        resolver: zodResolver(ExportPublicationSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            to: '',
            exportReviews: false,
        },
    });

    useEffect(() => {
        if (exportPub.isError && exportPub.error) {
            // Here, we don't really use 'errors' because the endpoint shouldn't return these errors
            setError(exportPub.error);
        } else if (!exportPub.isLoading && exportPub.data) {
            notificationDispatcher({
                type: 'add',
                item: { severity: 'success', message: 'Successfully export publication' },
            });
            onClose();
        }
    }, [exportPub.isError, exportPub.isLoading, exportPub.data]);

    const onSubmit: SubmitHandler<IExportPublication> = async (data) => {
        await exportPub.mutateAsync({
            username,
            name,
            params: {
                ...data,
                revision,
            },
        });
    };

    return (
        <Dialog fullWidth={true} onClose={onClose} open={open}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Export Publication</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControl component="fieldset" sx={{ pb: 1 }}>
                        <FormLabel component="legend"> Select a Journal to export this publication to:</FormLabel>
                        <Controller
                            rules={{ required: true }}
                            control={control}
                            name="to"
                            render={({ field, fieldState: { error } }) => (
                                <>
                                    <Select {...field}>
                                        {Object.entries(journalUrls).map(([key, value]) => {
                                            return (
                                                <MenuItem key={key} value={value}>
                                                    {key}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                    {typeof error !== 'undefined' && (
                                        <FormHelperText error>{error.message}</FormHelperText>
                                    )}
                                </>
                            )}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel component="legend">Should the export contain reviews?</FormLabel>
                        <Controller
                            name="exportReviews"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel control={<Checkbox {...field} />} label="export" />
                            )}
                        />
                    </FormControl>
                    {error && <ErrorBanner message={error.message} errors={error.errors} />}
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" color="secondary" sx={{ mr: 1 }} onClick={onClose}>
                            Cancel
                        </Button>
                        <LoadingButton
                            variant="contained"
                            loading={exportPub.isLoading}
                            disabled={!isValid || isSubmitting}
                            type="submit"
                        >
                            Confirm
                        </LoadingButton>
                    </Box>
                </DialogActions>
            </form>
        </Dialog>
    );
}
