const NewLike = require('../../Domains/likes/entities/NewLike');

class ToggleCommentLikeUseCase {
    constructor({ commentLikeRepository, threadRepository, commentRepository }) {
        this._commentLikeRepository = commentLikeRepository;
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute(useCasePayload) {
        const { threadId, commentId } = new NewLike(useCasePayload);
        const { userId } = useCasePayload;

        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.verifyCommentAvailability(commentId);

        const result = await this._commentLikeRepository.checkIfUserLikedComment(userId, commentId);

        const isLiked = result.length > 0;

        if (isLiked) {
            await this._commentLikeRepository.unlikeComment(userId, commentId);
        } else {
            await this._commentLikeRepository.likeComment(userId, commentId);
        }
    }
}

module.exports = ToggleCommentLikeUseCase;
