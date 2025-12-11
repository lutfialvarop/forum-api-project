const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthTestHelper = require('../../../../tests/AuthTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    describe('when POST /threads/{threadId}/comments', () => {
        it('should response 201 and persisted comment', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            const requestPayload = {
                content: 'Comment content',
            };
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedComment).toBeDefined();
        });

        it('should response 401 when request without authentication', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            const requestPayload = {
                content: 'Comment content',
            };
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments',
                payload: requestPayload,
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should response 404 when thread not found', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const requestPayload = {
                content: 'Comment content',
            };
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-999/comments',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
        });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
        it('should response 200 and delete comment', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123',
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
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123',
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should response 404 when comment not found', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-999',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
        });

        it('should response 403 when user is not comment owner', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-456', username: 'joni' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server, 'joni');

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
        });
    });
});
