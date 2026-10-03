package org.devbulchandani.backend.config;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BedrockConfiguration {
    @Bean
    public ChatModel bedrockChatModel(
            @Value("${bedrock.region:ap-south-1}") String region,
            @Value("${bedrock.model-id:openai.gpt-oss-20b}") String modelId) {
        String apiKey = System.getenv("AWS_BEARER_TOKEN_BEDROCK");
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("AWS_BEARER_TOKEN_BEDROCK is required for Bedrock Mantle");
        }
        ChatModel model = OpenAiChatModel.builder()
                .baseUrl("https://bedrock-mantle." + region + ".api.aws/v1")
                .apiKey(apiKey)
                .modelName(modelId)
                .maxRetries(3)
                .temperature(0.2)
                .maxTokens(4096)
                .build();
        return new ToolNameNormalizingChatModel(model);
    }
}
