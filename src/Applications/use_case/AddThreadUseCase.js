const AddThread = require('../../Domains/threads/entities/AddThread');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class AddThreadUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, owner) {
        const addThread = new AddThread({ ...useCasePayload, owner });
        const addedThreadResult = await this._threadRepository.addThread(addThread);
        return new AddedThread(addedThreadResult);
    }
}

module.exports = AddThreadUseCase;
