# Collaborative MindMap

A real-time collaborative mind mapping application built with Spring Boot, GraphQL, MongoDB, Thymeleaf, and Cytoscape.js.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can work on the same board simultaneously
- **Live Cursor Tracking**: See where your collaborators are on the board in real-time
- **Interactive Mind Maps**: Create, edit, and connect nodes with an intuitive drag-and-drop interface
- **Interactive Resize Handles**: Adobe XD-style resize handles for adjusting node dimensions
- **Rich Text Formatting**: Font size, bold, and italic text styling
- **Advanced Zoom Controls**: Precise zoom controls with keyboard shortcuts and reduced scroll sensitivity
- **Connect Mode**: Easy-to-use mode for creating connections between nodes
- **GraphQL API**: Efficient data querying and mutations
- **WebSocket Subscriptions**: Live updates when other users make changes
- **User Authentication**: Secure login and registration with Spring Security
- **Board Sharing**: Share boards with other users with different permission levels (Read, Write, Admin)
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🛠️ Tech Stack

- **Backend**: Spring Boot 3.3.5
- **Authentication**: Spring Security 6
- **API**: Spring GraphQL with WebSocket subscriptions
- **Database**: MongoDB
- **Frontend**: Thymeleaf templates
- **Visualization**: Cytoscape.js
- **Build Tool**: Maven
- **Java Version**: 21

## 📋 Prerequisites

Before running this application, make sure you have:

1. **JDK 21** installed and configured
2. **Maven** (or use the included Maven wrapper)
3. **MongoDB** running locally on port 27017, or a MongoDB Atlas connection string
4. **Cursor/VS Code** with the following extensions (recommended):
   - Extension Pack for Java (Microsoft)
   - Spring Boot Extension Pack
   - Language Support for Java by Red Hat
   - Lombok Annotations Support (`GabrielBB.vscode-lombok`)
   - GraphQL (for syntax highlighting)
   - MongoDB for VS Code

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <https://github.com/MichaelStoikos/JavaAdvanced_ShortBurstProject.git>
cd JavaAdvanced_ShortBurstProject
```

### 2. Build the Project

```bash
mvn clean install
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

Or run the main class `CollaborativeMindMapApplication` from your IDE.

### 4. Access the Application

- **Application**: http://localhost:8080
- **GraphiQL**: http://localhost:8080/graphiql (GraphQL playground)
- **GraphQL Endpoint**: http://localhost:8080/graphql
- **WebSocket**: ws://localhost:8080/graphql-ws

### 5. Demo Account

A demo account is automatically created on first run:
- **Username**: `demo`
- **Password**: `demo123`
#### Second account for testing
- **Username**: `Firefox`
- **Password**: `demo123`

## 📖 Usage Guide

### Creating a Board

1. Log in to the application
2. Click "My Boards" in the navigation
3. Click "Create New Board"
4. Enter a title and description
5. Click "Create"

### Working with Nodes

- **Add Node**: Click "Add Node" button in the toolbar
- **Move Node**: Drag nodes to reposition them
- **Edit Node**: Double-click a node to edit its label
- **Delete Node**: Select a node and click "Delete Selected"
- **Change Color/Shape**: Use the toolbar controls before adding a node
- **Change Text Format**: Change font-size, bold, italic 
- **Connect Nodes Button**: Default way of connectivity is a bit weird so I added a button for it.

### Creating Connections (Edges)

- **Method 1**: Right-click on a source node, then click on a target node
- **Method 2**: Use the context menu on nodes

### Sharing Boards

1. Open a board
2. Click the "Share" button
3. Enter the username of the person you want to share with
4. Select permission level:
   - **Read**: View only
   - **Write**: Can edit nodes and edges
   - **Admin**: Full control including sharing
5. Click "Share"

## 🔌 GraphQL API Examples

### Query: Get My Boards

```graphql
query {
  myBoards {
    id
    title
    description
    createdAt
  }
}
```

### Mutation: Create a Node

```graphql
mutation {
  createNode(input: {
    boardId: "board-id"
    label: "My Node"
    x: 100.0
    y: 100.0
    color: "#3498db"
    shape: "ellipse"
  }) {
    id
    label
  }
}
```

### Subscription: Listen to Node Changes

```graphql
subscription {
  nodeChanged(boardId: "board-id") {
    node {
      id
      label
      x
      y
    }
    changeType
  }
}
```

## 📁 Project Structure

```
src/main/
├── java/com/mindmap/
│   ├── config/              # Configuration classes (WebSocket, DataInitializer)
│   ├── controller/          # Web and Auth controllers
│   ├── graphql/
│   │   ├── input/          # GraphQL input types
│   │   ├── resolver/       # Query, Mutation, Subscription resolvers
│   │   └── subscription/   # Subscription payload types (NodeChange, EdgeChange, CursorPosition)
│   ├── model/              # Domain models (User, Board, Node, Edge, Collaborator, Permission)
│   ├── repository/         # MongoDB repositories
│   ├── security/           # Security configuration and utilities
│   └── service/            # Business logic services (Board, Node, Edge, Subscription, User)
└── resources/
    ├── graphql/
    │   └── schema.graphqls # GraphQL schema definition
    ├── static/
    │   ├── css/
    │   │   └── style.css   # Main stylesheet
    │   └── js/
    │       ├── board.js    # Board view logic & GraphQL client
    │       ├── boards.js   # Boards list logic
    │       ├── cursor-tracking.js  # Real-time cursor tracking
    │       └── node-resize.js      # Interactive node resizing
    ├── templates/          # Thymeleaf templates (login, register, boards, board, index)
    └── application.yml     # Application configuration
```

## 🔐 Security

- Passwords are encrypted using BCrypt
- CSRF protection is enabled for web forms
- GraphQL endpoints are protected with Spring Security
- WebSocket connections require authentication
- Board access is controlled by ownership and collaboration permissions

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already in use:
1. Change the port in `application.yml`:
```yaml
server:
  port: 8081
```

## 🚧 Future Enhancements

- [ ] Board templates
- [ ] Export boards as images or PDF
- [ ] Version history and undo/redo
- [ ] Search and filter nodes
- [ ] Mobile-responsive design improvements
- [ ] Integration with external services (Google Drive, Dropbox)
- [ ] Collaborative text editing in nodes
- [ ] Comments and annotations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on the repository.