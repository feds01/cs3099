import React, { ReactElement } from 'react';
import { Control, Path, useController } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField/TextField';

interface Props<T> {
    name: Path<T>;
    control: Control<T>;
    textFieldProps?: TextFieldProps;
}

export default function ControlledTextField<T>({ name, control, textFieldProps }: Props<T>): ReactElement {
    const {
        field: { ref, ...inputProps },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: { required: true },
    });

    return (
        <TextField
            {...inputProps}
            size="small"
            fullWidth
            sx={{
                marginTop: 1,
                marginBottom: 1,
            }}
            {...textFieldProps}
            {...(typeof error !== 'undefined' && {
                error: true,
                helperText: error.message,
            })}
        />
    );
}
