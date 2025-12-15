const AuthTestHelper = {
    async getAccessToken(server, username = 'dicoding', password = 'secret') {
        const response = await server.inject({
            method: 'POST',
            url: '/authentications',
            payload: {
                username,
                password,
            },
        });

        const responseJson = JSON.parse(response.payload);

        if (!responseJson.data || !responseJson.data.accessToken) {
            throw new Error(`Login gagal: ${response.payload}`);
        }

        return responseJson.data.accessToken;
    },
};

module.exports = AuthTestHelper;
