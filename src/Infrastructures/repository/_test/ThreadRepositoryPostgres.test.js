const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    beforeEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addThread function', () => {
        it('should persist add thread and return added thread correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });

            const addThread = new AddThread({
                title: 'thread title',
                body: 'thread body',
                owner: 'user-123',
            });

            const fakeIdGenerator = () => '123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await threadRepositoryPostgres.addThread(addThread);

            // Assert
            const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
            expect(threads).toHaveLength(1);
        });

        it('should return added thread correctly', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });

            const addThread = new AddThread({
                title: 'thread title',
                body: 'thread body',
                owner: 'user-123',
            });

            const fakeIdGenerator = () => '123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const addedThread = await threadRepositoryPostgres.addThread(addThread);

            // Assert
            expect(addedThread).toStrictEqual(
                new AddedThread({
                    id: 'thread-123',
                    title: 'thread title',
                    owner: 'user-123',
                })
            );
        });
    });

    describe('verifyThreadAvailability function', () => {
        it('should throw NotFoundError when thread not available', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).rejects.toThrowError('thread tidak ditemukan');
        });

        it('should not throw NotFoundError when thread available', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123')).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('getThreadById function', () => {
        it('should throw NotFoundError when thread not found', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
            // Action & Assert
            await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrowError(NotFoundError);
        });

        it('should return thread detail correctly', async () => {
            // Arrange
            const currentDate = new Date();
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread({
                id: 'thread-123',
                title: 'thread title',
                body: 'thread body',
                owner: 'user-123',
                date: currentDate,
            });
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
            // Action
            const threadDetail = await threadRepositoryPostgres.getThreadById('thread-123');
            // Assert
            expect(threadDetail.id).toEqual('thread-123');
            expect(threadDetail.title).toEqual('thread title');
            expect(threadDetail.body).toEqual('thread body');
            expect(threadDetail.date).toEqual(currentDate);
            expect(threadDetail.username).toEqual('dicoding');
        });
    });
});
