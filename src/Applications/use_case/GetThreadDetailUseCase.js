const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
    constructor({ threadRepository, commentRepository, replyRepository, commentLikeRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
        this._commentLikeRepository = commentLikeRepository;
    }

    async execute(threadId) {
        await this._threadRepository.verifyThreadAvailability(threadId);
        const thread = await this._threadRepository.getThreadById(threadId);
        const comments = await this._commentRepository.getCommentsByThreadId(threadId);

        const commentIds = comments.map((comment) => comment.id);

        let likeCounts = [];
        if (this._commentLikeRepository) {
            likeCounts = await this._commentLikeRepository.getLikeCountsByCommentIds(commentIds);
        }

        const mappedComments = await Promise.all(
            comments.map(async (comment) => {
                let replies = [];

                if (this._replyRepository) {
                    const commentReplies = await this._replyRepository.getRepliesByCommentId(comment.id);
                    replies = commentReplies.map((reply) => ({
                        id: reply.id,
                        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
                        date: reply.date,
                        username: reply.username,
                    }));
                }

                const likeCountItem = likeCounts.find((item) => item.comment_id === comment.id);
                const likeCount = likeCountItem ? Number(likeCountItem.count) : 0;

                return {
                    id: comment.id,
                    username: comment.username,
                    date: comment.date,
                    content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
                    replies,
                    likeCount,
                };
            })
        );

        return new ThreadDetail({
            ...thread,
            date: new Date(thread.date).toISOString(),
            comments: mappedComments,
        });
    }
}

module.exports = GetThreadDetailUseCase;
