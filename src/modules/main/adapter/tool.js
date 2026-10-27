let eventBack = {}, eventId = 0
globalThis.nodeRequire.receive("api:fetch", (_, data) => {
    let { eventId, event, payload } = data

    if (eventBack[eventId]) {
        eventBack[eventId](event, payload)
    }
})
export let $fetch = function (options) {
    return new Promise((resolve, reject) => {
        try {
            let _eventId = eventId
            eventId++

            let resOn = {}
            let res = {
                on(event, callback) {
                    resOn[event] = callback
                }
            }

            eventBack[_eventId] = (event, payload) => {
                if (event === "data") {
                    resOn["data"](payload)
                } else if (event === "end") {
                    resOn["end"](payload)
                } else if (event === "error") {
                    resOn["error"](payload)
                }

                if (event === "end" || event === "error") delete eventBack[_eventId]
            }

            resolve(res)

            globalThis.nodeRequire.ipcRenderer.send("api:fetch", {
                eventId: _eventId,
                method: options.method,
                url: options.url,
                data: options.body
            })

        } catch (error) {
            reject(error)
        }
    })
}

let doit = (url, method, data) => {
    return new Promise(function (resolve, reject) {
        $fetch({
            url,
            method,
            body: data
        }).then(res => {
            let data = {}
            res.on('end', (payload) => {
                resolve(payload)
            })
        })
    })
}

export let $remote = {
    get(url) {
        return doit(url, "GET")
    },
    post(url, data) {
        return doit(url, "POST", data)
    },
    patch(url, data) {
        return doit(url, "PATCH", data)
    },
    delete(url) {
        return doit(url, "DELETE")
    }
}