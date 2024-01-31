const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { callOpenAiApi } = require('../openAiService');
const { Server } = require('socket.io');
const io = require('socket.io-client');

const mockAxios = new MockAdapter(axios);

describe('callOpenAiApi', () => {
    let server, client;

    beforeAll((done) => {
        server = new Server();
        server.listen(3001); // using different port just for test server
        client = io.connect(`http://localhost:3001`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true,
            transports: ['websocket']
        });
        client.on('connect', done);
    });

    afterAll(() => {
        if (client) client.close();
        if (server) server.close();
    });

    afterEach(() => {
        if (client) client.disconnect();
        if (server) {
            server.close();
            server = null;
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    test('should emit a response with the correct data on successful API call', async () => {
        expect.assertions(2); // we expect two assertions

        const responseData = {
            data: {
                id: "response-id",
                choices: [{ text: "Response from OpenAI" }]
            }
        };

        mockAxios.onPost().replyOnce(200, responseData);

        const responsePromise = new Promise((resolve) => {
            client.on('openai_response', (data) => {
                resolve(data);
            });
        });

        callOpenAiApi([{ text: 'Hello', sender: 'user' }], server, 1);

        const response = await responsePromise;
        expect(response.response).toEqual(responseData.data);
        expect(response.requestId).toEqual(1);
    });

    test('should emit an error when the OpenAI API request fails', async () => {
        expect.assertions(2); // we expect two assertions

        const errorResponse = {
            message: 'Error occurred'
        };

        mockAxios.onPost().networkErrorOnce();

        const errorPromise = new Promise((resolve) => {
            client.on('openai_error', (data) => {
                resolve(data);
            });
        });

        callOpenAiApi([{ text: 'Invalid request', sender: 'user' }], server, 1);

        const error = await errorPromise;
        expect(error.error.message).toEqual(errorResponse.message);
        expect(error.requestId).toEqual(1);
    });
});