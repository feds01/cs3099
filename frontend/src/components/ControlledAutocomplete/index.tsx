import React, { ReactElement } from 'react'
import Autocomplete from '@mui/material/Autocomplete';
import { Control, Path, useController } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';

interface Props<T> {
    name: Path<T>;
    control: Control<T>;
    textFieldProps?: TextFieldProps;
}


export default function ControlledAutocomplete<T>({name, control, textFieldProps}: Props<T>): ReactElement {
    const {
        field: { ref, ...inputProps },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: { required: true },
    });

    return (
        <Autocomplete
        multiple
        options={[]} // @@TODO: convert this to a user search input
        freeSolo
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
    )
}
