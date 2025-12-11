const AddReply = require('../AddReply');

describe('AddReply entities', () => {
    it('should throw error when payload not contain needed property', () => {
        // Arrange
        const payload = {
            content: 'reply content',
            commentId: 'comment-123',
        };

        // Action & Assert
        expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload not meet data type specification', () => {
        // Arrange
        const payload = {
            content: 123,
            commentId: 'comment-123',
            owner: 'user-123',
        };

        // Action & Assert
        expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create AddReply entities correctly', () => {
        // Arrange
        const payload = {
            content: 'reply content',
            commentId: 'comment-123',
            owner: 'user-123',
        };

        // Action
        const addReply = new AddReply(payload);

        // Assert
        expect(addReply.content).toEqual(payload.content);
        expect(addReply.commentId).toEqual(payload.commentId);
        expect(addReply.owner).toEqual(payload.owner);
    });
});
