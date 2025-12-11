const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthTestHelper = require('../../../../tests/AuthTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    describe('when POST /threads', () => {
        it('should response 201 and persisted thread', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const requestPayload = {
                title: 'Thread Title',
                body: 'Thread Body',
            };
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedThread).toBeDefined();
            expect(responseJson.data.addedThread.id).toBeDefined();
            expect(responseJson.data.addedThread.title).toEqual('Thread Title');
            expect(responseJson.data.addedThread.owner).toEqual('user-123');
        });

        it('should response 401 when request without authentication', async () => {
            // Arrange
            const requestPayload = {
                title: 'Thread Title',
                body: 'Thread Body',
            };
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should response 400 when request payload not contain needed property', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            const requestPayload = {
                title: 'Thread Title',
            };
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
        });
    });

    describe('when GET /threads/{threadId}', () => {
        it('should return thread detail correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread({
                id: 'thread-123',
                title: 'Thread Title',
                body: 'Thread Body',
                owner: 'user-123',
            });
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-123',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.thread).toBeDefined();
            expect(responseJson.data.thread.id).toEqual('thread-123');
            expect(responseJson.data.thread.title).toEqual('Thread Title');
            expect(responseJson.data.thread.body).toEqual('Thread Body');
        });

        it('should return 404 when thread not found', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-999',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
        });
    });

    describe('AuthTestHelper failure scenario', () => {
        it('should throw error when getAccessToken receives wrong credentials', async () => {
            // Arrange
            const server = await createServer(container);
            await UsersTableTestHelper.addUser({ username: 'usergagal', password: 'password_benar' });

            // Action & Assert
            await expect(AuthTestHelper.getAccessToken(server, 'usergagal', 'password_salah')).rejects.toThrowError(/^Login gagal:/);
        });
    });
});
