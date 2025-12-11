const CommentDetail = require("../CommentDetail");

describe("CommentDetail entities", () => {
    it("should throw error when payload did not contain needed property", () => {
        // Arrange
        const payload = {
            id: "comment-123",
            username: "dicoding",
            date: "2024-01-01T00:00:00.000Z",
        };

        // Action and Assert
        expect(() => new CommentDetail(payload)).toThrowError("COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    });

    it("should throw error when payload did not meet data type specification", () => {
        // Arrange
        const payload = {
            id: 123,
            username: "dicoding",
            date: "2024-01-01T00:00:00.000Z",
            content: "a comment",
            replies: [],
        };

        // Action and Assert
        expect(() => new CommentDetail(payload)).toThrowError("COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    });

    it("should create CommentDetail object correctly", () => {
        // Arrange
        const payload = {
            id: "comment-123",
            username: "dicoding",
            date: "2024-01-01T00:00:00.000Z",
            content: "a comment",
        };

        // Action
        const commentDetail = new CommentDetail(payload);

        // Assert
        expect(commentDetail.id).toEqual(payload.id);
        expect(commentDetail.username).toEqual(payload.username);
        expect(commentDetail.date).toEqual(payload.date);
        expect(commentDetail.content).toEqual(payload.content);
        expect(commentDetail.replies).toBeUndefined();
    });

    it("should create CommentDetail object correctly with replies", () => {
        // Arrange
        const payload = {
            id: "comment-123",
            username: "dicoding",
            date: "2024-01-01T00:00:00.000Z",
            content: "a comment",
            replies: [],
        };

        // Action
        const commentDetail = new CommentDetail(payload);

        // Assert
        expect(commentDetail.id).toEqual(payload.id);
        expect(commentDetail.username).toEqual(payload.username);
        expect(commentDetail.date).toEqual(payload.date);
        expect(commentDetail.content).toEqual(payload.content);
        expect(commentDetail.replies).toEqual(payload.replies);
    });

    describe("_formatComments function", () => {
        it("should format comments correctly and handle deleted comment", () => {
            // Arrange
            const dummyPayload = {
                id: "comment-123",
                username: "dicoding",
                date: "2024-01-01T00:00:00.000Z",
                content: "a comment",
            };
            const commentDetail = new CommentDetail(dummyPayload);
            const rawComments = [
                {
                    id: "comment-111",
                    username: "userA",
                    date: new Date("2024-01-01T07:00:00.000Z"),
                    content: "first comment",
                    is_delete: false,
                },
                {
                    id: "comment-222",
                    username: "userB",
                    date: new Date("2024-01-02T08:00:00.000Z"),
                    content: "deleted comment",
                    is_delete: true,
                },
            ];

            // Action
            const formattedComments = commentDetail._formatComments(rawComments);

            // Assert
            expect(formattedComments).toHaveLength(2);
            expect(formattedComments[0].content).toEqual("first comment");
            expect(formattedComments[1].content).toEqual("**komentar telah dihapus**");
            expect(formattedComments[0].date).toEqual("2024-01-01T07:00:00.000Z");
        });
    });
});
