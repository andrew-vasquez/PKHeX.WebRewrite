(function () {
    const channel = 'pkhex-web-bridge';
    let bridgeRef = null;

    function post(type, message) {
        if (!window.parent || window.parent === window) return;
        window.parent.postMessage({ channel, type, ...message }, '*');
    }

    window.pkhexBridge = {
        initialize(ref) {
            bridgeRef = ref;

            post('ready', {});

            window.addEventListener('message', async (event) => {
                const data = event.data;
                if (!data || data.channel !== channel || data.type !== 'request' || !bridgeRef) return;

                try {
                    const responseJson = await bridgeRef.invokeMethodAsync(
                        'HandleRequest',
                        JSON.stringify({ command: data.command, payload: data.payload ?? {} })
                    );
                    const response = JSON.parse(responseJson);
                    post('response', {
                        requestId: data.requestId,
                        success: response.success,
                        data: response.data,
                        error: response.error
                    });
                } catch (error) {
                    post('response', {
                        requestId: data.requestId,
                        success: false,
                        error: error instanceof Error ? error.message : 'Bridge request failed.'
                    });
                }
            });
        }
    };
})();
