package org.devbulchandani.backend.config;

import dev.langchain4j.agent.tool.ToolExecutionRequest;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.response.ChatResponse;

import java.util.List;

/** Normalizes GPT-OSS channel annotations that Bedrock Mantle can append to tool names. */
final class ToolNameNormalizingChatModel implements ChatModel {
    private final ChatModel delegate;

    ToolNameNormalizingChatModel(ChatModel delegate) { this.delegate = delegate; }

    @Override
    public ChatResponse chat(ChatRequest request) {
        ChatResponse response = delegate.chat(request);
        AiMessage message = response.aiMessage();
        if (message == null || !message.hasToolExecutionRequests()) return response;
        List<ToolExecutionRequest> normalized = message.toolExecutionRequests().stream().map((tool) -> {
            String name = tool.name();
            int marker = name.indexOf("<|");
            if (marker >= 0) name = name.substring(0, marker);
            return name.equals(tool.name()) ? tool : tool.toBuilder().name(name).build();
        }).toList();
        AiMessage normalizedMessage = AiMessage.builder().text(message.text()).thinking(message.thinking())
                .attributes(message.attributes()).toolExecutionRequests(normalized).build();
        return response.toBuilder().aiMessage(normalizedMessage).build();
    }

    @Override public ChatResponse doChat(ChatRequest request) { return chat(request); }
    @Override public dev.langchain4j.model.chat.request.ChatRequestParameters defaultRequestParameters() { return delegate.defaultRequestParameters(); }
    @Override public java.util.List<dev.langchain4j.model.chat.listener.ChatModelListener> listeners() { return delegate.listeners(); }
    @Override public dev.langchain4j.model.ModelProvider provider() { return delegate.provider(); }
    @Override public java.util.Set<dev.langchain4j.model.chat.Capability> supportedCapabilities() { return delegate.supportedCapabilities(); }
}
