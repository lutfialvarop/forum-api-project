const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    const cleanDB = async () => {
        await CommentLikesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    };

    beforeAll(async () => {
        await cleanDB();
    });

    afterEach(async () => {
        await cleanDB();
    });

    describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
        it('should response 200 when like toggle is successful', async () => {
            // Arrange
            const userId = 'user-likes-123';
            const threadId = 'thread-likes-123';
            const commentId = 'comment-likes-123';
            const username = 'dicoding-likes';

            await UsersTableTestHelper.addUser({ id: userId, username: username }); // Password default: 'secret'
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

            const server = await createServer(container);

            // Login
            const authResponse = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: {
                    username: username,
                    password: 'secret',
                },
            });
            const {
                data: { accessToken },
            } = JSON.parse(authResponse.payload);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${threadId}/comments/${commentId}/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });

        it('should response 401 when request without authentication', async () => {
            // Arrange
            const userId = 'user-likes-123';
            const threadId = 'thread-likes-123';
            const commentId = 'comment-likes-123';

            await UsersTableTestHelper.addUser({ id: userId });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${threadId}/comments/${commentId}/likes`,
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should response 404 when thread not found', async () => {
            // Arrange
            const userId = 'user-likes-123';
            const username = 'dicoding-likes';

            // Hanya buat user untuk login
            await UsersTableTestHelper.addUser({ id: userId, username: username });

            const server = await createServer(container);
            const authResponse = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: {
                    username: username,
                    password: 'secret',
                },
            });
            const {
                data: { accessToken },
            } = JSON.parse(authResponse.payload);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: '/threads/thread-999/comments/comment-likes-123/likes',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toEqual(404);
        });

        it('should response 404 when comment not found', async () => {
            // Arrange
            const userId = 'user-likes-123';
            const threadId = 'thread-likes-123';
            const username = 'dicoding-likes';

            await UsersTableTestHelper.addUser({ id: userId, username: username });
            await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

            const server = await createServer(container);
            const authResponse = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: {
                    username: username,
                    password: 'secret',
                },
            });
            const {
                data: { accessToken },
            } = JSON.parse(authResponse.payload);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${threadId}/comments/comment-999/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            expect(response.statusCode).toEqual(404);
        });
    });
});
