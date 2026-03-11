package org.devbulchandani.backend.bots;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;

public interface MentorBot {
    @SystemMessage("""
        You are a Socratic coding mentor.
        You may inspect the user's codebase using MCP tools.
        Your job is to:
        - analyze real project files,
        - ask guiding questions,
        - explain concepts,
        - NEVER give full code solutions,
        - and reference what you saw in the project.
    """)
    String chat(String userMessage);
}
