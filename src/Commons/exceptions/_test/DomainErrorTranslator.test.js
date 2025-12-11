const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');

describe('DomainErrorTranslator', () => {
    it('should translate error correctly', () => {
        expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
        expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER'))).toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));
        expect(DomainErrorTranslator.translate(new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat membuat thread karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat membuat thread karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat menambahkan thread karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat menambahkan thread karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat menambahkan komentar karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat menambahkan komentar karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat menambahkan balasan komentar karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat menambahkan balasan komentar karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat menambahkan balasan komentar karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat menambahkan balasan komentar karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat mendapatkan detail thread karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat mendapatkan detail thread karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat mendapatkan detail komentar karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat mendapatkan detail komentar karena tipe data tidak sesuai'));
        expect(DomainErrorTranslator.translate(new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY'))).toStrictEqual(new InvariantError('tidak dapat mendapatkan detail balasan komentar karena properti yang dibutuhkan tidak ada'));
        expect(DomainErrorTranslator.translate(new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION'))).toStrictEqual(new InvariantError('tidak dapat mendapatkan detail balasan komentar karena tipe data tidak sesuai'));
    });

    it('should return original error when error message is not needed to translate', () => {
        // Arrange
        const error = new Error('some_error_message');

        // Action
        const translatedError = DomainErrorTranslator.translate(error);

        // Assert
        expect(translatedError).toStrictEqual(error);
    });
});
