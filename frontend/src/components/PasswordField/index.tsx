import React, { ReactElement, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextField, { TextFieldProps } from '@mui/material/TextField';

export default function PasswordField(fields: TextFieldProps): ReactElement {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <div>
            <TextField
                {...fields}
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
        </div>
    );
}
