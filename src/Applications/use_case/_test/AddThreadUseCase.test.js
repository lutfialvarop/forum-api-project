const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread'); // 1. Import AddedThread
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
    it('should orchestrating the add thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            title: 'dicoding',
            body: 'secret',
        };
        const mockOwner = 'user-123';

        const mockAddedThread = {
            id: 'thread-123',
            title: useCasePayload.title,
            owner: mockOwner,
        };

        const expectedAddedThread = new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            owner: mockOwner,
        });

        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedThread));

        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const addedThread = await addThreadUseCase.execute(useCasePayload, mockOwner);

        // Assert
        expect(addedThread).toStrictEqual(expectedAddedThread);
        expect(mockThreadRepository.addThread).toBeCalledWith(
            new AddThread({
                title: useCasePayload.title,
                body: useCasePayload.body,
                owner: mockOwner,
            })
        );
    });
});
