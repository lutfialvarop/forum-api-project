const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
    const mockIdGenerator = () => '123';

    beforeEach(async () => {
        await RepliesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addReply function', () => {
        it('should persist add reply and return added reply correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

            const newReply = new AddReply({
                content: 'This is a reply',
                commentId: 'comment-123',
                owner: 'user-123',
            });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action
            const addedReply = await replyRepositoryPostgres.addReply(newReply);

            // Assert
            const replyFromDb = await RepliesTableTestHelper.findReplyById('reply-123');
            expect(replyFromDb).toBeDefined();
            expect(replyFromDb.content).toEqual(newReply.content);
            expect(replyFromDb.owner).toEqual(newReply.owner);

            expect(addedReply).toStrictEqual(
                new AddedReply({
                    id: 'reply-123',
                    content: 'This is a reply',
                    owner: 'user-123',
                })
            );
        });
    });

    describe('verifyReplyAvailability function', () => {
        it('should throw NotFoundError when reply not available', async () => {
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-999')).rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError when reply available', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
            await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123' });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123')).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('verifyReplyOwner function', () => {
        it('should throw AuthorizationError when reply owner is not match', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
            await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-999')).rejects.toThrowError(AuthorizationError);
        });

        it('should not throw AuthorizationError when reply owner is match', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
            await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
        });
    });

    describe('deleteReply function', () => {
        it('should delete reply correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
            await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123' });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action
            await replyRepositoryPostgres.deleteReply('reply-123');

            // Assert
            const deletedReply = await RepliesTableTestHelper.findReplyById('reply-123');
            expect(deletedReply.is_delete).toBe(true);
        });
    });

    describe('getRepliesByCommentId function', () => {
        it('should return replies correctly', async () => {
            // Arrange
            const userPayload = { id: 'user-123', username: 'dicoding' };
            const threadPayload = { id: 'thread-123', owner: 'user-123' };
            const commentPayload = { id: 'comment-123', threadId: 'thread-123' };
            const firstReplyPayload = { id: 'reply-123', commentId: 'comment-123', owner: 'user-123', content: 'first reply', date: new Date('2024-01-01T00:00:00Z') };
            const secondReplyPayload = { id: 'reply-124', commentId: 'comment-123', owner: 'user-123', content: 'second reply', date: new Date('2024-01-02T00:00:00Z') };

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);
            await RepliesTableTestHelper.addReply(firstReplyPayload);
            await RepliesTableTestHelper.addReply(secondReplyPayload);

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action
            const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

            // Assert
            expect(replies).toHaveLength(2);

            expect(replies[0].id).toEqual(firstReplyPayload.id);
            expect(replies[0].username).toEqual(userPayload.username);
            expect(replies[0].date).toEqual(firstReplyPayload.date);
            expect(replies[0].content).toEqual(firstReplyPayload.content);
            expect(replies[0].is_delete).toBe(false);

            expect(replies[1].id).toEqual(secondReplyPayload.id);
            expect(replies[1].username).toEqual(userPayload.username);
            expect(replies[1].date).toEqual(secondReplyPayload.date);
            expect(replies[1].content).toEqual(secondReplyPayload.content);
            expect(replies[1].is_delete).toBe(false);
        });

        it('should return empty array when no replies found', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, mockIdGenerator);

            // Action
            const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

            // Assert
            expect(replies).toHaveLength(0);
        });
    });
});
