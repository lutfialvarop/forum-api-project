const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");

class GetThreadDetailUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        await this._threadRepository.verifyThreadAvailability(threadId);
        const thread = await this._threadRepository.getThreadById(threadId);
        const comments = await this._commentRepository.getCommentsByThreadId(threadId);

        const mappedComments = await Promise.all(
            comments.map(async (comment) => {
                let replies = [];

                if (this._replyRepository) {
                    const commentReplies = await this._replyRepository.getRepliesByCommentId(comment.id);
                    replies = commentReplies.map((reply) => ({
                        id: reply.id,
                        content: reply.is_delete ? "**balasan telah dihapus**" : reply.content,
                        date: reply.date,
                        username: reply.username,
                    }));
                }

                return {
                    id: comment.id,
                    username: comment.username,
                    date: comment.date,
                    content: comment.is_delete ? "**komentar telah dihapus**" : comment.content,
                    replies,
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
