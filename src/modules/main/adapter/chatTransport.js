import { ChatTransportAdapter, generator } from "@auipage/react"
import { $remote, $fetch } from "./tool"

// 定义对话连接
export default new ChatTransportAdapter({

    /**
     * @param messages - 聊天消息历史数组
     * @param context - 比如context.tools可用的工具对象集合等
     */
    // https://zxl20070701.github.io/notebook/index.html#/program/language/javascript/grammar/iterator-generator
    async *run({ messages, context }) {

        // 开启一场新的对话以后，虽然还是原来的对话界面，但历史消息应该进行预处理，而不是直接使用原始消息
        // console.log("本对话的历史消息", context.history);

        // 显示思考状态
        yield { type: "loading", text: "思考中" }

        // 拦截流式响应：工具调用结束后再次显示"思考中"，等待 LLM 重新响应
        let stream = generator(function (callYield, callEnd, callError) {
            $fetch({
                url: "/api/chat",
                method: "POST",
                body: {
                    messages,
                    tools: context.tools
                }
            }).then(res => {

                res.on('data', payload => {
                    callYield(payload)
                })

                res.on('end', () => {
                    callEnd()
                })

                res.on('error', callError)

            }).catch(callError)
        })

        for await (let payload of stream) {
            yield payload

            // 工具调用结束后，等待 LLM 再次响应
            if (payload.type === "tool-call") {
                // 前端工具：pending 是流上的唯一事件，页面执行完毕并回传结果后 LLM 才会继续
                if (payload.caller === "frontend" && payload.status === "pending") {
                    yield { type: "loading", text: "思考中" }
                }
                // 后端工具：success / error 标志调用结束
                else if (payload.caller === "backend" && (payload.status === "success" || payload.status === "error")) {
                    yield { type: "loading", text: "思考中" }
                }
            }
        }

    },

    // 响应智能体请求
    // 对于工具执行结果 name = "tool-result"
    response(name, data) {
        return $remote.post(`/api/chat/${name}`, data)
    }

})