const AddReply = require("../../Domains/replies/entities/AddReply");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class AddReplyUseCase {
    constructor({ replyRepository, commentRepository, threadRepository }) {
        this._replyRepository = replyRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const addReply = new AddReply(useCasePayload);
        await this._threadRepository.verifyThreadAvailability(useCasePayload.threadId);
        await this._commentRepository.verifyCommentAvailability(useCasePayload.commentId);
        const addedReplyResult = await this._replyRepository.addReply(addReply);
        return new AddedReply(addedReplyResult);
    }
}

module.exports = AddReplyUseCase;
