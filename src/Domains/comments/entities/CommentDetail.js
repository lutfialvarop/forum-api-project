class CommentDetail {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, username, date, content, replies } = payload;

        this.id = id;
        this.username = username;
        this.date = date;
        this.content = content;

        if (replies !== undefined) {
            this.replies = replies;
        }
    }

    _verifyPayload({ id, username, date, content }) {
        if (!id || !username || !date || !content) {
            throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof content !== 'string') {
            throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }

    _formatComments(comments) {
        return comments.map((comment) => ({
            id: comment.id,
            username: comment.username,
            date: new Date(comment.date).toISOString(),
            content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
        }));
    }
}

module.exports = CommentDetail;
