const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
    const mockIdGenerator = () => '123';

    beforeEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addComment function', () => {
        it('should persist add comment and return added comment correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

            const newComment = new AddComment({
                content: 'This is a comment',
                threadId: 'thread-123',
                owner: 'user-123',
            });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action
            const addedComment = await commentRepositoryPostgres.addComment(newComment);

            // Assert
            const commentFromDb = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(commentFromDb).toBeDefined();
            expect(commentFromDb.content).toEqual(newComment.content);
            expect(commentFromDb.owner).toEqual(newComment.owner);

            expect(addedComment).toStrictEqual(
                new AddedComment({
                    id: 'comment-123',
                    content: 'This is a comment',
                    owner: 'user-123',
                })
            );
        });
    });

    describe('verifyCommentAvailability function', () => {
        it('should throw NotFoundError when comment not available', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-999')).rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError when comment available', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentAvailability('comment-123')).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('verifyCommentOwner function', () => {
        it('should throw AuthorizationError when comment owner is not match', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-999')).rejects.toThrowError(AuthorizationError);
        });

        it('should not throw AuthorizationError when comment owner is match', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
        });
    });

    describe('deleteComment function', () => {
        it('should delete comment correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action
            await commentRepositoryPostgres.deleteComment('comment-123');

            // Assert
            const deletedComment = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(deletedComment.is_delete).toBe(true);
        });
    });

    describe('getCommentsByThreadId function', () => {
        it('should return comments correctly', async () => {
            // Arrange
            const userPayload = { id: 'user-123', username: 'dicoding' };
            const threadPayload = { id: 'thread-123', owner: 'user-123' };
            const firstCommentPayload = { id: 'comment-123', threadId: 'thread-123', owner: 'user-123', content: 'first comment', date: new Date('2024-01-01T00:00:00Z') };
            const secondCommentPayload = { id: 'comment-124', threadId: 'thread-123', owner: 'user-123', content: 'second comment', date: new Date('2024-01-02T00:00:00Z') };

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(firstCommentPayload);
            await CommentsTableTestHelper.addComment(secondCommentPayload);

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action
            const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

            // Assert
            expect(comments).toHaveLength(2);

            expect(comments[0].id).toEqual(firstCommentPayload.id);
            expect(comments[0].username).toEqual(userPayload.username);
            expect(comments[0].date).toEqual(firstCommentPayload.date);
            expect(comments[0].content).toEqual(firstCommentPayload.content);
            expect(comments[0].is_delete).toBe(false);

            expect(comments[1].id).toEqual(secondCommentPayload.id);
            expect(comments[1].username).toEqual(userPayload.username);
            expect(comments[1].date).toEqual(secondCommentPayload.date);
            expect(comments[1].content).toEqual(secondCommentPayload.content);
            expect(comments[1].is_delete).toBe(false);
        });

        it('should return empty array when no comments found', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, mockIdGenerator);

            // Action
            const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

            // Assert
            expect(comments).toHaveLength(0);
        });
    });
});
