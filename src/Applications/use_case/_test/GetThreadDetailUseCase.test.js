const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
    it('should orchestrate the get thread detail action correctly with comments and replies', async () => {
        // Arrange
        const useCasePayload = 'thread-123';

        const mockThread = {
            id: 'thread-123',
            title: 'a thread title',
            body: 'a thread body',
            date: '2024-01-01T00:00:00.000Z',
            username: 'user-a',
        };

        const mockComments = [
            {
                id: 'comment-123',
                username: 'user-b',
                date: '2024-01-01T01:00:00.000Z',
                content: 'a comment',
                is_delete: false,
            },
            {
                id: 'comment-456',
                username: 'user-c',
                date: '2024-01-01T02:00:00.000Z',
                content: 'a deleted comment',
                is_delete: true,
            },
        ];

        const mockReplies = [
            {
                id: 'reply-123',
                content: 'a reply',
                date: '2024-01-01T01:10:00.000Z',
                username: 'user-c',
                is_delete: false,
            },
            {
                id: 'reply-456',
                content: 'a deleted reply',
                date: '2024-01-01T01:20:00.000Z',
                username: 'user-a',
                is_delete: true,
            },
        ];

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
        mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));
        mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));

        mockReplyRepository.getRepliesByCommentId = jest.fn().mockImplementation(async (commentId) => {
            if (commentId === 'comment-123') {
                return mockReplies;
            }
            return [];
        });

        const getThreadDetailUseCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Action
        const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

        // Assert
        expect(threadDetail).toEqual({
            ...mockThread,
            comments: [
                {
                    id: 'comment-123',
                    username: 'user-b',
                    date: '2024-01-01T01:00:00.000Z',
                    content: 'a comment',
                    replies: [
                        {
                            id: 'reply-123',
                            content: 'a reply',
                            date: '2024-01-01T01:10:00.000Z',
                            username: 'user-c',
                        },
                        {
                            id: 'reply-456',
                            content: '**balasan telah dihapus**',
                            date: '2024-01-01T01:20:00.000Z',
                            username: 'user-a',
                        },
                    ],
                },
                {
                    id: 'comment-456',
                    username: 'user-c',
                    date: '2024-01-01T02:00:00.000Z',
                    content: '**komentar telah dihapus**',
                    replies: [],
                },
            ],
        });

        expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(useCasePayload);
        expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload);
        expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload);
        expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-123');
        expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-456');
    });

    it('should not fetch replies if replyRepository is not provided', async () => {
        // Arrange
        const threadId = 'thread-123';
        const mockThread = {
            id: threadId,
            title: 'thread title',
            body: 'thread body',
            date: new Date(),
            username: 'dicoding',
        };
        const mockComments = [
            {
                id: 'comment-123',
                username: 'userA',
                date: new Date(),
                content: 'a comment',
                is_delete: false,
            },
        ];

        const mockThreadRepository = {};
        mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve());
        mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));

        const mockCommentRepository = {};
        mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));

        const getThreadDetailUseCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        const threadDetail = await getThreadDetailUseCase.execute(threadId);

        // Assert
        expect(threadDetail.comments[0].replies).toBeDefined();
        expect(threadDetail.comments[0].replies).toEqual([]);
        expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
        expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
        expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    });
});
