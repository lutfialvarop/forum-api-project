class CommentLikeRepository {
    async likeComment(userId, commentId) {
        throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async unlikeComment(userId, commentId) {
        throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async checkIfUserLikedComment(userId, commentId) {
        throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getLikeCountByCommentId(commentId) {
        throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getLikeCountsByCommentIds(commentIds) {
        throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = CommentLikeRepository;
