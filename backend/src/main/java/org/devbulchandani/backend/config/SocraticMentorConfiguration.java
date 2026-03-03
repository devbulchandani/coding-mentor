package org.devbulchandani.backend.config;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.service.AiServices;
import org.devbulchandani.backend.bots.MentorBot;
import org.devbulchandani.backend.bots.NotesGeneratorBot;
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
    public NotesGeneratorBot notesGeneratorBot(@Qualifier("gemini2") ChatModel gemini) {
        return AiServices.builder(NotesGeneratorBot.class)
                .chatModel(gemini)
                .build();
    }

}
