package org.devbulchandani.backend.config;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import org.devbulchandani.backend.bots.MentorBot;
import org.devbulchandani.backend.bots.NotesGenerationBot;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocraticMentorConfiguration {
    @Bean
    public MentorBot mentorBot(
            @Qualifier("bedrockChatModel") ChatModel bedrockChatModel,
            McpToolProvider repoToolProvider) {

        return AiServices.builder(MentorBot.class)
                .chatModel(bedrockChatModel)
                .toolProvider(repoToolProvider)
                .build();
    }

    @Bean
    public NotesGenerationBot notesBot(
            @Qualifier("bedrockChatModel") ChatModel bedrockChatModel,
            McpToolProvider repoToolProvider) {

        return AiServices.builder(NotesGenerationBot.class)
                .chatModel(bedrockChatModel)
                .toolProvider(repoToolProvider)
                .build();
    }
}
