package org.devbulchandani.backend.config;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;

import dev.langchain4j.mcp.client.transport.http.StreamableHttpMcpTransport;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class McpConfiguration {
    @Bean
    public McpTransport repoMcpTransport(
            @Value("${app.mcp.repo-url:http://localhost:8081/mcp}") String repoMcpUrl) {
        return StreamableHttpMcpTransport.builder()
                .url(repoMcpUrl)
                .logRequests(true)
                .logResponses(true)
                .build();
    }

    @Bean(destroyMethod = "close")
    public McpClient repoMcpClient(McpTransport repoMcpTransport) {
        return DefaultMcpClient.builder()
                .key("repo-analyzer")
                .transport(repoMcpTransport)
                .build();
    }

    @Bean
    public McpToolProvider repoToolProvider(McpClient repoMcpClient) {
        return McpToolProvider.builder()
                .mcpClients(repoMcpClient)
                .filterToolNames(
                        "analyze_project",
                        "read_file",
                        "read_files"
                )
                .build();
    }
}
