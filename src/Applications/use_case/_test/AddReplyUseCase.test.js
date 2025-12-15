const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
    it('should orchestrating the add reply action correctly', async () => {
        // Arrange
        const useCasePayload = {
            content: 'reply content',
            commentId: 'comment-123',
            threadId: 'thread-123',
            owner: 'user-123',
        };

        const mockAddedReply = {
            id: 'reply-123',
            content: useCasePayload.content,
            owner: useCasePayload.owner,
        };

        const expectedAddedReply = new AddedReply({
            id: 'reply-123',
            content: useCasePayload.content,
            owner: useCasePayload.owner,
        });

        const mockReplyRepository = new ReplyRepository();
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
        mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());
        mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockAddedReply));

        const addReplyUseCase = new AddReplyUseCase({
            replyRepository: mockReplyRepository,
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action
        const addedReply = await addReplyUseCase.execute(useCasePayload);

        // Assert
        expect(addedReply).toStrictEqual(expectedAddedReply);
        expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload.commentId);
        expect(mockReplyRepository.addReply).toBeCalledWith(
            new AddReply({
                content: useCasePayload.content,
                commentId: useCasePayload.commentId,
                owner: useCasePayload.owner,
            })
        );
    });
});
