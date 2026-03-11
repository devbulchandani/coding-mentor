package org.devbulchandani.backend.config;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;

import dev.langchain4j.mcp.client.transport.http.StreamableHttpMcpTransport;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class McpConfiguration {
    @Bean
    public McpTransport repoMcpTransport() {
        return StreamableHttpMcpTransport.builder()
                .url("https://buildspace-repo-analyzer-985437920499.asia-south1.run.app/mcp")
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
