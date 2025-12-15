const NewLike = require('../NewLike');

describe('a NewLike entity', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            threadId: 'thread-123',
        };

        // Action and Assert
        expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            threadId: 123,
            commentId: 'comment-123',
        };

        // Action and Assert
        expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create newLike object correctly', () => {
        // Arrange
        const payload = {
            threadId: 'thread-123',
            commentId: 'comment-123',
        };

        // Action
        const newLike = new NewLike(payload);

        // Assert
        expect(newLike.threadId).toEqual(payload.threadId);
        expect(newLike.commentId).toEqual(payload.commentId);
    });
});
