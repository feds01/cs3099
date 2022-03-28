import _ from 'lodash';
import CodeRenderer from '.';
import { ReviewStatus } from '../../lib/api/models';
import { mockReview } from '../../test-utils/mocks/review';
import renderWithWrapper from '../../test-utils/render';

jest.mock('../../contexts/auth');

describe('CodeRenderer tests', () => {
    const observeFn = jest.fn();
    const unobserveFn = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('CodeRender displays text with no highlighting', () => {
        const mockedReview = mockReview({ status: ReviewStatus.completed });

        // Mock the IntersectionObserver
        const mockIntersectionObserver = jest.fn();
        mockIntersectionObserver.mockReturnValue({
            observe: observeFn,
            unobserve: unobserveFn,
            disconnect: () => null,
        });
        window.IntersectionObserver = mockIntersectionObserver;

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

        // Test that the IntersectionObserver has been called once to observe the 'pre'
        // element that renders the code.
        expect(observeFn).toHaveBeenCalledTimes(1);

        expect(asFragment()).toMatchSnapshot();
    });

    it('CodeRender displays text with highlighting', () => {
        const mockedReview = mockReview({ status: ReviewStatus.completed });

        // This is a function to capture the callback that's passed into the intersection observer.
        // It is initialised with a dummy implementation which will then be later overridden with
        // the captured passed in callback once the IntersectionObserver is called.
        let intersectionCallback: (entries: Partial<IntersectionObserverEntry>[]) => void = jest.fn();

        // Mock the IntersectionObserver and capture the passed in callback from the intersection
        // observer.
        const mockIntersectionObserver = jest.fn().mockImplementation((callback, _options) => {
            intersectionCallback = callback;

            return {
                observe: observeFn,
                unobserve: unobserveFn,
                disconnect: () => null,
            };
        });

        window.IntersectionObserver = mockIntersectionObserver;

        const { asFragment, container } = renderWithWrapper(
            <CodeRenderer
                contents={'let x = 5;'}
                filename={'test.tsx'}
                lineNumbers={true}
                lineOffset={5}
                language={'typescript'}
                review={mockedReview}
            />,
        );

        const preElement = container.querySelector('pre')!;

        // Test that the IntersectionObserver has been called once to observe the 'pre'
        // element that renders the code.
        expect(observeFn).toHaveBeenCalledTimes(1);

        if (typeof intersectionCallback !== 'undefined') {
            intersectionCallback([
                {
                    isIntersecting: true,
                    target: preElement,
                },
            ]);
        }

        // Verify that we stop observing the element
        expect(unobserveFn).toHaveBeenCalledTimes(1);

        expect(asFragment()).toMatchSnapshot();
    });
});
