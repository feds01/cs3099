import CommentCard from '.';
import { Comment } from '../../lib/api/models';
import { mockComment } from '../../test-utils/mocks/comment';
import { mockPublication } from '../../test-utils/mocks/publication';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';
import { format } from 'date-fns';

describe('CommentCard tests', () => {
    it('renders comment', () => {
        const mockedComment = mockComment();
        const { getByText } = renderWithWrapper(<CommentCard comment={mockedComment}/>);
        const username = mockedComment.author.name;
        expect(getByText(`${mockedComment.contents}`)).toBeInTheDocument();
        expect(getByText(`${username}`)).toBeInTheDocument();
        if (mockedComment.edited){
            expect(getByText("edited")).toBeInTheDocument();
        } else {
            expect(getByText("edited")).not.toBeInTheDocument();
        }
        expect(getByText(`${format(mockedComment.updatedAt, 'do MMM')}`)).toBeInTheDocument();
        
    });
    
})