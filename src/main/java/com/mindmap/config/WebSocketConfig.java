package com.mindmap.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.server.webmvc.GraphQlWebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GraphQlWebSocketHandler graphQlWebSocketHandler;

    public WebSocketConfig(GraphQlWebSocketHandler graphQlWebSocketHandler) {
        this.graphQlWebSocketHandler = graphQlWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(graphQlWebSocketHandler, "/graphql-ws")
                .setAllowedOrigins("*");
    }
}

