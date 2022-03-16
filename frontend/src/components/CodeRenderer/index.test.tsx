import CodeRenderer from '.';
import { ReviewStatus } from '../../lib/api/models';
import { mockReview } from '../../test-utils/mocks/review';
import renderWithWrapper from '../../test-utils/render';

jest.mock('../../contexts/auth');

describe('CodeRenderer tests', () => {
    it('Code is rendered', () => {
        const mockedReview = mockReview({ status: ReviewStatus.completed });

        const { asFragment } = renderWithWrapper(
            <CodeRenderer
                contents={'let x = 5;'}
                filename={'test.tsx'}
                lineNumbers={true}
                lineOffset={5}
                language={'typescript'}
                review={mockedReview}
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
