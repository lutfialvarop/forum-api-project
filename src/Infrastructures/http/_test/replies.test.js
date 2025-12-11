const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const AuthTestHelper = require("../../../../tests/AuthTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/replies endpoint", () => {
    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await UsersTableTestHelper.cleanTable();
    });

    afterEach(async () => {
        await RepliesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
        it("should response 201 and persisted reply", async () => {
            // Arrange
            const requestPayload = {
                content: "Reply content",
            };

            const server = await createServer(container);

            await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });

            const accessToken = await AuthTestHelper.getAccessToken(server, "dicoding");

            await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
            await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });

            // Action
            const response = await server.inject({
                method: "POST",
                url: "/threads/thread-123/comments/comment-123/replies",
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual("success");
            expect(responseJson.data.addedReply).toBeDefined();
            expect(responseJson.data.addedReply.id).toBeDefined();
            expect(responseJson.data.addedReply.content).toEqual("Reply content");
            expect(responseJson.data.addedReply.owner).toEqual("user-123");
        });

        it("should response 401 when request without authentication", async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: "user-123" });
            await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
            await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
            const requestPayload = {
                content: "Reply content",
            };
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: "POST",
                url: "/threads/thread-123/comments/comment-123/replies",
                payload: requestPayload,
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it("should response 404 when comment not found", async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
            const requestPayload = {
                content: "Reply content",
            };
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server, "dicoding");

            // Action
            const response = await server.inject({
                method: "POST",
                url: "/threads/thread-123/comments/comment-999/replies",
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toBeDefined();
        });

        it("should response 400 when request payload not contain needed property", async () => {
            // Arrange
            const requestPayload = {};
            const server = await createServer(container);
            await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
            const accessToken = await AuthTestHelper.getAccessToken(server, "dicoding");
            await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
            await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });

            // Action
            const response = await server.inject({
                method: "POST",
                url: "/threads/thread-123/comments/comment-123/replies",
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toBeDefined();
        });
    });

    describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
        it("should response 200 and delete reply", async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
            await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
            await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
            await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server, "dicoding");

            // Action
            const response = await server.inject({
                method: "DELETE",
                url: "/threads/thread-123/comments/comment-123/replies/reply-123",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual("success");
        });

        it("should response 401 when request without authentication", async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: "user-123" });
            await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
            await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
            await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: "DELETE",
                url: "/threads/thread-123/comments/comment-123/replies/reply-123",
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it("should response 404 when reply not found", async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server, "dicoding");

            // Action
            const response = await server.inject({
                method: "DELETE",
                url: "/threads/thread-123/comments/comment-123/replies/reply-999",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toBeDefined();
        });

        it("should response 403 when user is not reply owner", async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
            await UsersTableTestHelper.addUser({ id: "user-456", username: "joni" });
            await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
            await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
            await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });
            const server = await createServer(container);
            const accessToken = await AuthTestHelper.getAccessToken(server, "joni");

            // Action
            const response = await server.inject({
                method: "DELETE",
                url: "/threads/thread-123/comments/comment-123/replies/reply-123",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual("fail");
            expect(responseJson.message).toBeDefined();
        });
    });
});
