import React from "react";

/** 文本片段：沿用 aui-chat-content-part 基础类承载气泡样式 */
export default function UITextPart(props) {

    // 兜底：内容为空时不渲染空气泡
    let children = props.children;
    let isEmpty = children == null
        || (typeof children === "string" && children.trim() === "")
        || (Array.isArray(children) && children.every((c) => c == null || (typeof c === "string" && c.trim() === "")));

    if (isEmpty) {
        return null;
    }

    return (
        <span className="aui-chat-content-part aui-chat-content-part-text">
            {children}
        </span>
    );
}
