exports.up = (pgm) => {
    pgm.createTable('comment_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        comment_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        date: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Add foreign key constraints
    pgm.addConstraint('comment_likes', 'fk_comment_likes.comment_id_comments.id', {
        foreignKeys: {
            columns: 'comment_id',
            references: 'comments(id)',
            onDelete: 'CASCADE',
        },
    });

    pgm.addConstraint('comment_likes', 'fk_comment_likes.user_id_users.id', {
        foreignKeys: {
            columns: 'user_id',
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
    });

    // Add unique constraint to prevent duplicate likes
    pgm.addConstraint('comment_likes', 'unique_comment_user_like', {
        unique: ['comment_id', 'user_id'],
    });
};

exports.down = (pgm) => {
    pgm.dropTable('comment_likes');
};
