import CodeRenderer from '.';
import { mockReview } from '../../test-utils/mocks/review';
import renderWithWrapper from '../../test-utils/render';

describe('CodeRenderer tests', () => {
    it('Code is rendered', () => {
        const mockedReview = mockReview();
        const { getByText } = renderWithWrapper(
            <CodeRenderer
                contents={'let x = 5;'}
                filename={'test.tsx'}
                lineNumbers={true}
                lineOffset={5}
                language={'typescript'}
                review={mockedReview}
            />,
        );

        expect(getByText('let x = 5;')).toBeInTheDocument();
    });
});
