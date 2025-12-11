const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'a reply',
            date: '2024-01-01T00:00:00.000Z',
        };

        // Action and Assert
        expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            content: 'a reply',
            date: '2024-01-01T00:00:00.000Z',
            username: 'dicoding',
        };

        // Action and Assert
        expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create ReplyDetail object correctly', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'a reply',
            date: '2024-01-01T00:00:00.000Z',
            username: 'dicoding',
        };

        // Action
        const replyDetail = new ReplyDetail(payload);

        // Assert
        expect(replyDetail.id).toEqual(payload.id);
        expect(replyDetail.content).toEqual(payload.content);
        expect(replyDetail.date).toEqual(payload.date);
        expect(replyDetail.username).toEqual(payload.username);
    });

    describe('_formatReplies function', () => {
        it('should format replies correctly and handle deleted reply', () => {
            // Arrange
            const dummyPayload = {
                id: 'reply-123',
                content: 'a reply',
                date: '2024-01-01T00:00:00.000Z',
                username: 'dicoding',
            };
            const replyDetail = new ReplyDetail(dummyPayload);
            const rawReplies = [
                {
                    id: 'reply-111',
                    username: 'userA',
                    date: new Date('2024-01-01T07:00:00.000Z'),
                    content: 'first reply',
                    is_delete: false,
                },
                {
                    id: 'reply-222',
                    username: 'userB',
                    date: new Date('2024-01-02T08:00:00.000Z'),
                    content: 'deleted reply',
                    is_delete: true,
                },
            ];

            // Action
            const formattedReplies = replyDetail._formatReplies(rawReplies);

            // Assert
            expect(formattedReplies).toHaveLength(2);
            expect(formattedReplies[0].content).toEqual('first reply');
            expect(formattedReplies[1].content).toEqual('**balasan telah dihapus**');
            expect(formattedReplies[0].date).toEqual('2024-01-01T07:00:00.000Z');
        });
    });
});
