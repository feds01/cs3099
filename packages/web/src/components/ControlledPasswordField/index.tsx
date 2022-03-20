import React, { ReactElement, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import InputAdornment from '@mui/material/InputAdornment';
import { Control, Path, useController } from 'react-hook-form';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField, { TextFieldProps } from '@mui/material/TextField/TextField';

interface Props<T> {
    name: Path<T>;
    control: Control<T>;
    textFieldProps?: TextFieldProps;
}

export default function ControlledPasswordField<T>({ name, control, textFieldProps }: Props<T>): ReactElement {
    const [showPassword, setShowPassword] = useState<boolean>(false);
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
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            type={showPassword ? 'text' : 'password'}
        />
    );
}
