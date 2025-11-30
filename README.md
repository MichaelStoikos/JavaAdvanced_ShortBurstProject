# Collaborative MindMap

A real-time collaborative mind mapping application built with Spring Boot, GraphQL, MongoDB, Thymeleaf, and Cytoscape.js.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can work on the same board simultaneously
- **Interactive Mind Maps**: Create, edit, and connect nodes with an intuitive drag-and-drop interface
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
git clone <repository-url>
cd JavaAdvanced_ShortBurstProject
```

### 2. Configure MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is running on `localhost:27017`
- The application will automatically create a database named `mindmap`

**Option B: MongoDB Atlas**
- Edit `src/main/resources/application.yml`
- Replace the MongoDB URI:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://username:password@cluster.mongodb.net/mindmap
```

### 3. Build the Project

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

Or run the main class `CollaborativeMindMapApplication` from your IDE.

### 5. Access the Application

- **Application**: http://localhost:8080
- **GraphiQL**: http://localhost:8080/graphiql (GraphQL playground)
- **GraphQL Endpoint**: http://localhost:8080/graphql
- **WebSocket**: ws://localhost:8080/graphql-ws

### 6. Demo Account

A demo account is automatically created on first run:
- **Username**: `demo`
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
│   ├── config/              # Configuration classes
│   ├── controller/          # Web and Auth controllers
│   ├── graphql/
│   │   ├── input/          # GraphQL input types
│   │   ├── resolver/       # Query, Mutation, Subscription resolvers
│   │   └── subscription/   # Subscription payload types
│   ├── model/              # Domain models (User, Board, Node, Edge)
│   ├── repository/         # MongoDB repositories
│   ├── security/           # Security configuration and utilities
│   └── service/            # Business logic services
└── resources/
    ├── graphql/
    │   └── schema.graphqls # GraphQL schema definition
    ├── static/
    │   ├── css/           # Stylesheets
    │   └── js/            # JavaScript files
    ├── templates/         # Thymeleaf templates
    └── application.yml    # Application configuration
```

## 🔐 Security

- Passwords are encrypted using BCrypt
- CSRF protection is enabled for web forms
- GraphQL endpoints are protected with Spring Security
- WebSocket connections require authentication
- Board access is controlled by ownership and collaboration permissions

## 🐛 Troubleshooting

### MongoDB Connection Issues

If you see connection errors:
1. Verify MongoDB is running: `mongosh` or check MongoDB Compass
2. Check the connection string in `application.yml`
3. Ensure firewall allows connections to port 27017

### Lombok Not Working

If you see compilation errors related to getters/setters:
1. Install the Lombok extension in Cursor/VS Code
2. Enable annotation processing in your IDE
3. Rebuild the project: `mvn clean install`

### Port Already in Use

If port 8080 is already in use:
1. Change the port in `application.yml`:
```yaml
server:
  port: 8081
```

## 🚧 Future Enhancements

- [ ] Real-time cursor tracking for collaborators
- [ ] Board templates
- [ ] Export boards as images or PDF
- [ ] Version history and undo/redo
- [ ] Advanced node styling options
- [ ] Search and filter nodes
- [ ] Mobile-responsive design improvements
- [ ] Integration with external services (Google Drive, Dropbox)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on the repository.