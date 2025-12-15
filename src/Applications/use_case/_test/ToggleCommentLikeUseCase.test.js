const ToggleCommentLikeUseCase = require('../ToggleCommentLikeUseCase');
const CommentLikeRepository = require('../../../Domains/likes/CommentLikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('ToggleCommentLikeUseCase', () => {
    it('should throw error if payload not contain threadId or commentId', async () => {
        // Arrange
        const useCasePayload = {
            // threadId missing
            commentId: 'comment-123',
            userId: 'user-123',
        };

        const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({});

        // Action & Assert
        await expect(toggleCommentLikeUseCase.execute(useCasePayload)).rejects.toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload not meet data type specification', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 123,
            commentId: 'comment-123',
            userId: 'user-123',
        };

        const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({});

        // Action & Assert
        await expect(toggleCommentLikeUseCase.execute(useCasePayload)).rejects.toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrate the like action correctly when not liked yet', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        };

        const mockCommentLikeRepository = new CommentLikeRepository();
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
        mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());

        mockCommentLikeRepository.checkIfUserLikedComment = jest.fn(() => Promise.resolve([]));
        mockCommentLikeRepository.likeComment = jest.fn(() => Promise.resolve());

        const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
            commentLikeRepository: mockCommentLikeRepository,
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await toggleCommentLikeUseCase.execute(useCasePayload);

        // Assert
        expect(mockCommentLikeRepository.checkIfUserLikedComment).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
        expect(mockCommentLikeRepository.likeComment).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
    });

    it('should orchestrate the unlike action correctly when already liked', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
            userId: 'user-123',
        };

        const mockCommentLikeRepository = new CommentLikeRepository();
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
        mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve());

        mockCommentLikeRepository.checkIfUserLikedComment = jest.fn(() => Promise.resolve([{ id: 'xxx' }]));
        mockCommentLikeRepository.unlikeComment = jest.fn(() => Promise.resolve());

        const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
            commentLikeRepository: mockCommentLikeRepository,
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await toggleCommentLikeUseCase.execute(useCasePayload);

        // Assert
        expect(mockCommentLikeRepository.unlikeComment).toBeCalledWith(useCasePayload.userId, useCasePayload.commentId);
    });
});
