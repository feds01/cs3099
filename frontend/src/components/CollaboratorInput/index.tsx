import { User } from '../../lib/api/models';
import { PureUserAvatar } from '../UserAvatar';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { ReactElement } from 'react';
import { Control, Path, useController } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material';

interface CollaboratorInputProps<T> {
    name: Path<T>;
    control: Control<T>;
    textFieldProps?: TextFieldProps;
    collaborators: User[];
}

const getOptionLabel = (option: string | User): string => {
    if (typeof option === 'string') {
        return option;
    } else {
        return option.username;
    }
};

const getOptionIcon = (option: string | User, sx?: SxProps<Theme>) => {
    if (typeof option === 'string') {
        return <PureUserAvatar size={24} username={option} sx={sx} />;
    } else {
        return <PureUserAvatar size={24} {...option} sx={sx} />;
    }
};

const getOptionDescription = (option: string | User): string | undefined => {
    if (typeof option !== 'string') {
        return option.about;
    }
};

export default function CollaboratorInput<T>({
    name,
    control,
    textFieldProps,
    collaborators,
}: CollaboratorInputProps<T>): ReactElement {
    const {
        field: { ref, onChange, value, ...inputProps },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: { required: true },
    });

    const userNames = collaborators.map((collaborator) => collaborator.username);

    return (
        <Autocomplete
            multiple
            options={[...collaborators]}
            value={[
                ...collaborators.filter((x) => (value as string[]).includes(x.username)),
                ...(value as string[]).filter((x) => !userNames.includes(x)),
            ]}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.username)}
            freeSolo
            onChange={(e, data) => {
                onChange(data.map(getOptionLabel));
            }}
            renderOption={(props, option) => {
                const label = getOptionLabel(option);
                const icon = getOptionIcon(option);
                const description = getOptionDescription(option);

                return (
                    <Box
                        component={'li'}
                        {...props}
                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                    >
                        <Box sx={{ pr: 1 }}>{icon}</Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{label} </Typography>
                        {typeof description !== 'undefined' && (
                            <Box
                                component="span"
                                sx={{
                                    textOverflow: 'ellipsis',
                                    fontStyle: 'italic',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                - {description}
                            </Box>
                        )}
                    </Box>
                );
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        avatar={getOptionIcon(option, { ml: 0.5 })}
                        label={typeof option === 'string' ? option : option.username}
                        {...getTagProps({ index })}
                    />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...inputProps}
                    {...textFieldProps}
                    {...(typeof error !== 'undefined' && {
                        error: true,
                        helperText: error.message,
                    })}
                />
            )}
        />
    );
}
