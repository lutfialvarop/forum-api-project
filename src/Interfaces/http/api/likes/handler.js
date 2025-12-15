const ToggleCommentLikeUseCase = require('../../../../Applications/use_case/ToggleCommentLikeUseCase');

class LikesHandler {
    constructor(container) {
        this._container = container;

        this.putLikeHandler = this.putLikeHandler.bind(this);
    }

    async putLikeHandler(request, h) {
        const { threadId, commentId } = request.params;
        const { id: userId } = request.auth.credentials;

        const toggleCommentLikeUseCase = this._container.getInstance(ToggleCommentLikeUseCase.name);

        await toggleCommentLikeUseCase.execute({
            threadId,
            commentId,
            userId,
        });

        const response = h.response({
            status: 'success',
        });
        response.code(200);
        return response;
    }
}

module.exports = LikesHandler;
