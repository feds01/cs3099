import { User } from '../../lib/api/models';
import { getUser } from '../../lib/api/users/users';
import { PureUserAvatar } from '../UserAvatar';
import { SxProps, Theme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { throttle } from 'lodash';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Control, Path, useController } from 'react-hook-form';

interface CollaboratorInputProps<T> {
    name: Path<T>;
    control: Control<T>;
    textFieldProps?: TextFieldProps;
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

const getUsernamesFromOptions = (values: (User | string)[]): string[] => {
    return values.map(getOptionLabel);
};

export default function CollaboratorInput<T>({
    name,
    control,
    textFieldProps,
}: CollaboratorInputProps<T>): ReactElement {
    const {
        field: { ref, onChange, value, ...inputProps },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: { required: true },
    });

    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);

    async function searchForUser(input: string) {
        try {
            const result = await getUser({ search: input, take: 10 });
            const values = new Set([...getUsernamesFromOptions(value as (User | string)[])]);

            // We don't want to add search results that have already been selected.
            setSearchResults(result.users.filter((x) => !values.has(x.username)));
        } catch (e: unknown) {}
    }
    // We want to wrap the search function in lodash.debounce so it's not thrashed
    const debouncedSearch = useCallback(throttle(searchForUser, 50), []);

    useEffect(() => {
        if (inputValue === '') {
            setSearchResults([]);
        } else {
            debouncedSearch(inputValue);
        }
    }, [inputValue]);

    const userNames = value as (string | User)[];

    return (
        <Autocomplete
            multiple
            options={[...userNames, ...searchResults]}
            value={userNames}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.username)}
            filterOptions={(x) => x}
            freeSolo
            onChange={(e, data) => onChange(data)}
            onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
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
