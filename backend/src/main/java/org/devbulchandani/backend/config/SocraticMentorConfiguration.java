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
            @Qualifier("gemini") ChatModel gemini,
            McpToolProvider repoToolProvider) {

        return AiServices.builder(MentorBot.class)
                .chatModel(gemini)
                .toolProvider(repoToolProvider)
                .build();
    }

    @Bean
    public NotesGenerationBot notesBot(
            @Qualifier("gemini2") ChatModel gemini2,
            McpToolProvider repoToolProvider) {

        return AiServices.builder(NotesGenerationBot.class)
                .chatModel(gemini2)
                .toolProvider(repoToolProvider)
                .build();
    }
}
