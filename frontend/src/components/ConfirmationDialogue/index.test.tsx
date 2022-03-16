import ConfirmationDialogue from '.';
import { fireEvent } from '@testing-library/react';
import renderWithWrapper from '../../test-utils/render';

describe('ConfirmationDialogue tests', () => {
    it('clicking confirm does correct thing, dialog renders correctly', () => {
        const onConfirm = jest.fn();
        const onClose = jest.fn();
        const confirmationLabel = 'Confirm';

        const { getByText } = renderWithWrapper(
            <ConfirmationDialogue
                title={'title'}
                confirmationLabel={confirmationLabel}
                onConfirm={onConfirm}
                onClose={onClose}
                message={'test'}
                isOpen={true}
                submitEnabled={false}
            />,
        );

        const confirmButton = getByText(confirmationLabel);
        fireEvent.click(confirmButton);
        expect(onConfirm).toBeCalled();
        expect(getByText('test')).toBeInTheDocument();
        expect(getByText('title')).toBeInTheDocument();
        expect(getByText('Cancel')).toBeInTheDocument();
        expect(getByText(`${confirmationLabel}`)).toBeInTheDocument();
    });
    it('clicking cancel does correct thing', () => {
        const onConfirm = jest.fn();
        const onClose = jest.fn();
        const confirmationLabel = 'Confirm';
        const { getByText } = renderWithWrapper(
            <ConfirmationDialogue
                title={'title'}
                confirmationLabel={confirmationLabel}
                onConfirm={onConfirm}
                onClose={onClose}
                message={'test'}
                isOpen={true}
                submitEnabled={false}
            />,
        );
        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(onClose).toBeCalled();
    });
});
