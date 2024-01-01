const _METHOD_TYPE = ["GET", "POST", "HEAD", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"];
class AsyncRequestSender {
    constructor(url) {
        this._url = url
        this._params = {}
        this._resolveCallback = undefined
        this._rejectCallback = undefined
        this._finallyCallback = undefined
        this._options = {
            method : "GET",
            mode: "cors", // no-cors, cors, same-origin
            cache: "no-cache",
            credentials: "same-origin", // omit
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            redirect: "follow", //manual, fallow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        }
        this._defaultHandler = {
            success : data => data,
            error: error => {
                console.error(error)
                throw error
            }
        }
        console.log("Async Request Sender is Ready")
    }

    setUrl(url) {
        this._url = url
        return this
    }

    setUrlParam(key, value) {
        if (value != null && value !== undefined && key !== "" && key != null && key !== undefined) {
            this._params[key] = value;
        }
        this._params[key] = value
        return this
    }

    setSuccessFn(callback) {
        console.log(callback)
        this._resolveCallback = callback
        return this
    }

    setFailFn(callback) {
        this._rejectCallback = callback
        return this
    }
    setFinallyFn(callback) {
        this._finallyCallback = callback
        return this
    }

    setMethod(methodType) {
        if( _METHOD_TYPE.indexOf(methodType.toUpperCase()) > 0) {
            this._options.method = methodType;
        } else {
            console.error("Invalid Mthod")
        }

        return this
    }

    setPostData(data) {
        this._options.data = JSON.stringify(data)
        return this
    }

    async send() {
        if (this._resolveCallback == undefined) { 
            const errMsg = "at least, Success Function MUST set. use .setSuccessFn( fn )"
            return console.error(errMsg)
        }

        try {
            var paramChain = ""
            let compositeUrl = this._url 
            let isFirst = true
            for (const [key, value] of Object.entries(this._params)) {
                if (isFirst) {
                    isFirst = false
                    paramChain = paramChain + key + "=" + value
                } else {
                    paramChain = "&" + paramChain + key + "=" + value
                }
            }

            if (!isFirst) {
                compositeUrl = compositeUrl + "?" + paramChain
            }

            console.log("Request URL - " + compositeUrl)

            const response = await fetch(compositeUrl, this._options);
            if (!response.ok) {
                throw new Error(`Request Fail. Status : ${response.status}`)
            }

            if (this._options.method.toUpperCase() === "GET") {
                if (this._resolveCallback != undefined) {
                    console.log("SUCCESS FUNCTION")
                    return await response.json().then(this._resolveCallback) 
                    // return await this._resolveCallback(response.json())
                }
            } else {
                // Other Methods
            }
        } catch (error) {
            if (this._rejectCallback) {
                this._rejectCallback(error)
            } else {
                console.warn("Error Callback is undefined")
            }
        } finally {
            if (this._finallyCallback) {
                this._finallyCallback()
            } else {
                console.warn("finally Callback is undefined")
            }
        }
    }
}