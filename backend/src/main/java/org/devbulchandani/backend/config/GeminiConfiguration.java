package org.devbulchandani.backend.config;

import dev.langchain4j.model.chat.ChatModel;

import dev.langchain4j.model.vertexai.gemini.VertexAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfiguration {

    @Bean
    public ChatModel gemini(){
        return VertexAiGeminiChatModel.builder()
                .project(System.getenv("PROJECT_ID"))
                .location("global")
                .apiEndpoint("aiplatform.googleapis.com")
                .modelName("gemini-3.1-pro-preview")
                .build();
    }

    @Bean
    public ChatModel gemini2() {
        return VertexAiGeminiChatModel.builder()
                .project(System.getenv("PROJECT_ID"))
                .location("us-central1")
                .modelName("gemini-2.5-pro")
                .maxRetries(5)
                .build();
    }
}
