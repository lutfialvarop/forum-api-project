const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('CommentLikeRepositoryPostgres', () => {
    const cleanDB = async () => {
        await CommentLikesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    };

    beforeAll(async () => {
        await cleanDB();
    });

    afterEach(async () => {
        await cleanDB();
    });

    afterAll(async () => {
        await pool.end();
    });

    const userId = 'user-repo-123';
    const threadId = 'thread-repo-123';
    const commentId = 'comment-repo-123';
    const likeId = 'like-repo-123';

    describe('likeComment function', () => {
        it('should persist like info correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: userId });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

            const fakeIdGenerator = () => '123';
            const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await commentLikeRepositoryPostgres.likeComment(userId, commentId);

            // Assert
            const like = await CommentLikesTableTestHelper.findLikeById('like-123');
            expect(like).toHaveLength(1);
        });
    });

    describe('unlikeComment function', () => {
        it('should delete like info correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: userId });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });
            await CommentLikesTableTestHelper.addLike({ id: likeId, userId: userId, commentId: commentId });

            const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, () => {});

            // Action
            await commentLikeRepositoryPostgres.unlikeComment(userId, commentId);

            // Assert
            const like = await CommentLikesTableTestHelper.findLikeById(likeId);
            expect(like).toHaveLength(0);
        });
    });

    describe('checkIfUserLikedComment function', () => {
        it('should return array with length 1 if liked', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: userId });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });
            await CommentLikesTableTestHelper.addLike({ userId: userId, commentId: commentId });

            const repo = new CommentLikeRepositoryPostgres(pool, () => {});

            // Action
            const result = await repo.checkIfUserLikedComment(userId, commentId);

            // Assert
            expect(result).toHaveLength(1);
        });

        it('should return empty array if not liked', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: userId });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

            const repo = new CommentLikeRepositoryPostgres(pool, () => {});

            // Action
            const result = await repo.checkIfUserLikedComment(userId, commentId);

            // Assert
            expect(result).toHaveLength(0);
        });
    });

    describe('getLikeCountByCommentId function', () => {
        it('should return array containing count', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding-repo' });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

            await CommentLikesTableTestHelper.addLike({ id: likeId, userId: userId, commentId: commentId });

            const repo = new CommentLikeRepositoryPostgres(pool, () => {});

            // Action
            const result = await repo.getLikeCountByCommentId(commentId);

            // Assert
            expect(result[0].count).toEqual('1');
        });
    });

    describe('getLikeCountsByCommentIds function', () => {
        it('should return like counts for multiple comments correctly', async () => {
            // Arrange
            const userA = 'user-repo-A';
            const userB = 'user-repo-B';
            const threadX = 'thread-repo-X';
            const comment1 = 'comment-repo-1';
            const comment2 = 'comment-repo-2';

            await UsersTableTestHelper.addUser({ id: userA, username: 'userA' });
            await UsersTableTestHelper.addUser({ id: userB, username: 'userB' });

            await ThreadsTableTestHelper.addThread({ id: threadX, owner: userA });
            await CommentsTableTestHelper.addComment({ id: comment1, threadId: threadX, owner: userA });
            await CommentsTableTestHelper.addComment({ id: comment2, threadId: threadX, owner: userA });

            await CommentLikesTableTestHelper.addLike({ id: 'like-repo-1', userId: userA, commentId: comment1 });
            await CommentLikesTableTestHelper.addLike({ id: 'like-repo-2', userId: userB, commentId: comment1 });

            await CommentLikesTableTestHelper.addLike({ id: 'like-repo-3', userId: userA, commentId: comment2 });

            const repo = new CommentLikeRepositoryPostgres(pool, {});

            // Action
            const result = await repo.getLikeCountsByCommentIds([comment1, comment2]);

            // Assert
            expect(result).toHaveLength(2);

            const count1 = result.find((r) => r.comment_id === comment1);
            expect(count1.count).toEqual('2');

            const count2 = result.find((r) => r.comment_id === comment2);
            expect(count2.count).toEqual('1');
        });

        it('should return empty list if provided comment IDs have no likes', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: userId });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

            const repo = new CommentLikeRepositoryPostgres(pool, {});

            // Action
            const result = await repo.getLikeCountsByCommentIds([commentId]);

            // Assert
            expect(result).toEqual([]);
        });
    });
});
