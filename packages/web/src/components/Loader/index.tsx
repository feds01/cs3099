import { keyframes, styled } from '@mui/material';

const rotate = keyframes`
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(360deg);
    }
`;

interface LoaderProps {
    loading?: boolean;
    size?: number;
    color?: string;
    sizeUnit?: 'px' | 'em' | 'rem';
}

export const Loader = ({ size = 30, color = '#fff', loading, sizeUnit = 'px' }: LoaderProps) => {
    return loading ? <Wrapper size={size} color={color} sizeUnit={sizeUnit} /> : null;
};

const Wrapper = styled('div', { shouldForwardProp: (prop) => prop !== 'loading' && prop !== 'sizeUnit' })<LoaderProps>(
    ({ size = 30, sizeUnit, color }) => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: `${size}${sizeUnit}`,
        height: `${size}${sizeUnit}`,
        border: `${size / 5}${sizeUnit} solid ${color}`,
        borderRightColor: 'transparent',
        borderRadius: '50%',
        animation: `${rotate} 0.75s linear infinite`,
    }),
);
