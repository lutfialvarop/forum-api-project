const CommentLikeRepository = require('../../Domains/likes/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async likeComment(userId, commentId) {
        const id = `like-${this._idGenerator()}`;
        const query = {
            text: 'INSERT INTO comment_likes(id, user_id, comment_id) VALUES($1, $2, $3)',
            values: [id, userId, commentId],
        };

        await this._pool.query(query);
    }

    async unlikeComment(userId, commentId) {
        const query = {
            // PERBAIKAN: Ganti 'owner' jadi 'user_id'
            text: 'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
            values: [userId, commentId],
        };

        await this._pool.query(query);
    }

    async checkIfUserLikedComment(userId, commentId) {
        const query = {
            // PERBAIKAN: Ganti 'owner' jadi 'user_id'
            text: 'SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
            values: [userId, commentId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getLikeCountByCommentId(commentId) {
        const query = {
            text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getLikeCountsByCommentIds(commentIds) {
        const query = {
            text: 'SELECT comment_id, COUNT(*) FROM comment_likes WHERE comment_id = ANY($1::text[]) GROUP BY comment_id',
            values: [commentIds],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = CommentLikeRepositoryPostgres;
