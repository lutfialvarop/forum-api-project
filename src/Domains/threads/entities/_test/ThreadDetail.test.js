const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
    it('should throw error when payload not contain needed property', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'thread title',
            body: 'thread body',
            date: '2021-08-08T07:19:09.775Z',
            username: 'dicoding',
        };

        // Action & Assert
        expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'thread title',
            body: 'thread body',
            date: '2021-08-08T07:19:09.775Z',
            username: 'dicoding',
            comments: 'not an array',
        };

        // Action & Assert
        expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create ThreadDetail entities correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'thread title',
            body: 'thread body',
            date: '2021-08-08T07:19:09.775Z',
            username: 'dicoding',
            comments: [],
        };

        // Action
        const threadDetail = new ThreadDetail(payload);

        // Assert
        expect(threadDetail.id).toEqual(payload.id);
        expect(threadDetail.title).toEqual(payload.title);
        expect(threadDetail.body).toEqual(payload.body);
        expect(threadDetail.date).toEqual(payload.date);
        expect(threadDetail.username).toEqual(payload.username);
        expect(threadDetail.comments).toEqual(payload.comments);
    });
});
