# Map - Visual Thinking and Diagram Creation

## What It Does

Map enables visual thinking by creating and manipulating diagrams, flowcharts, concept maps, and other visual representations. By externalizing structure visually, you discover relationships and generate insights that text alone can't reveal.

**Key Value**: Think in pictures, not just words. Map helps you see patterns, relationships, and gaps that are invisible in linear text.

## When to Use This Tool

- **System design** - Visualize architecture and data flows
- **Process mapping** - Document workflows and procedures
- **Concept exploration** - Map relationships between ideas
- **State machines** - Model system states and transitions
- **Decision trees** - Visualize choice paths
- **Problem decomposition** - Break complex problems into visual structure

## How It Works

Map provides operations to build and transform visual representations:

```
Create → Add Elements → Connect → Transform → Observe Insights
```

### Operations

| Operation | Purpose |
|-----------|---------|
| `create` | Start a new diagram |
| `update` | Modify existing elements |
| `delete` | Remove elements |
| `transform` | Apply visual changes (rotate, move, resize, recolor, regroup) |
| `observe` | Record observations and insights from the visual |

### Diagram Types

Map supports 11 diagram types, each optimized for different visualization needs. All diagrams output as **Mermaid syntax** for easy rendering.

| Type | Best For | When to Use |
|------|----------|-------------|
| `flowchart` | Processes, algorithms, decision paths | When mapping step-by-step procedures or control flow |
| `stateDiagram` | System states and transitions | When modeling simple state machines or workflows |
| `conceptMap` | Relationships between ideas | When exploring connections between concepts or components |
| `treeDiagram` | Hierarchies and decomposition | When showing parent-child relationships or organizational structure |
| `graph` | Networks and connections | When visualizing general networks or interconnected systems |
| `sequenceDiagram` | **Component interactions** | When showing message exchanges between actors/systems over time (API calls, protocol flows) |
| `stateMachine` | **System behavior** | When modeling complex state transitions with start/end states (order lifecycle, authentication flow) |
| `erDiagram` | **Data models** | When designing database schemas with entities, attributes, and relationships |
| `mindMap` | **Brainstorming and ideation** | When organizing ideas hierarchically around a central concept (feature planning, problem decomposition) |
| `contextDiagram` | **System context (C4 model)** | When showing high-level system boundaries with external actors and systems |
| `custom` | Anything else | When none of the specialized types fit your needs |

### Element Types

| Type | What It Represents |
|------|-------------------|
| `node` | A thing (concept, state, step) |
| `edge` | A relationship/connection |
| `container` | A grouping of elements |
| `annotation` | Notes or labels |

## Interactive Examples

### Scenario 1: Creating an Authentication Flowchart

**Context**: Mapping the user authentication flow to identify security checkpoints.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "user-auth-flow",
  "diagramType": "flowchart",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elements": [
    {"id": "start", "type": "node", "label": "User Visits Login Page", "properties": {"shape": "oval", "color": "green"}},
    {"id": "input", "type": "node", "label": "Enter Credentials", "properties": {"shape": "rectangle"}},
    {"id": "validate", "type": "node", "label": "Validate Credentials", "properties": {"shape": "diamond"}},
    {"id": "success", "type": "node", "label": "Redirect to Dashboard", "properties": {"shape": "rectangle", "color": "green"}},
    {"id": "failure", "type": "node", "label": "Show Error Message", "properties": {"shape": "rectangle", "color": "red"}},
    {"id": "edge1", "type": "edge", "source": "start", "target": "input", "properties": {}},
    {"id": "edge2", "type": "edge", "source": "input", "target": "validate", "properties": {}},
    {"id": "edge3", "type": "edge", "source": "validate", "target": "success", "label": "Valid", "properties": {}},
    {"id": "edge4", "type": "edge", "source": "validate", "target": "failure", "label": "Invalid", "properties": {}}
  ],
  "observation": "Mapping the authentication flow to identify security checkpoints"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "user-auth-flow",
  "diagramType": "flowchart",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elementCount": 9,
  "status": "success"
}
```

**What This Means**: A flowchart with 9 elements (5 nodes, 4 edges) has been created. The visual structure immediately shows:
- Linear flow from login to validation
- Decision point at validation (diamond shape)
- Two clear paths: success (green) and failure (red)

---

### Scenario 2: Creating a System Architecture Concept Map

**Context**: Visualizing microservices architecture to identify dependencies.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "system-architecture",
  "diagramType": "conceptMap",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elements": [
    {"id": "api", "type": "node", "label": "API Gateway", "properties": {"layer": "edge"}},
    {"id": "auth", "type": "node", "label": "Auth Service", "properties": {"layer": "services"}},
    {"id": "users", "type": "node", "label": "User Service", "properties": {"layer": "services"}},
    {"id": "db", "type": "node", "label": "PostgreSQL", "properties": {"layer": "data"}},
    {"id": "cache", "type": "node", "label": "Redis Cache", "properties": {"layer": "data"}},
    {"id": "e1", "type": "edge", "source": "api", "target": "auth", "label": "validates", "properties": {}},
    {"id": "e2", "type": "edge", "source": "api", "target": "users", "label": "routes to", "properties": {}},
    {"id": "e3", "type": "edge", "source": "users", "target": "db", "label": "persists", "properties": {}},
    {"id": "e4", "type": "edge", "source": "users", "target": "cache", "label": "caches", "properties": {}}
  ],
  "insight": "Visualizing the data flow reveals the cache as a potential single point of failure"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "system-architecture",
  "diagramType": "conceptMap",
  "iteration": 1,
  "nextOperationNeeded": true,
  "elementCount": 9,
  "status": "success"
}
```

**What This Means**: The concept map shows:
- **Layers**: Edge (API), Services (Auth, Users), Data (DB, Cache)
- **Dependencies**: API → Auth and Users; Users → DB and Cache
- **Insight discovered**: Cache is a SPOF - this might not be obvious from code alone

---

### Scenario 3: Transforming and Observing

**Context**: Reorganizing the diagram to highlight a different perspective.

**Input**:
```json
{
  "operation": "transform",
  "diagramId": "system-architecture",
  "diagramType": "conceptMap",
  "iteration": 2,
  "nextOperationNeeded": false,
  "transformationType": "regroup",
  "elements": [
    {"id": "critical-path", "type": "container", "label": "Critical Path", "contains": ["api", "auth", "users", "db"], "properties": {"highlight": true}},
    {"id": "cache-optional", "type": "container", "label": "Optional/Degradable", "contains": ["cache"], "properties": {"highlight": false}}
  ],
  "observation": "Regrouping by criticality shows which services must be highly available",
  "insight": "The cache should be optional - system must function (slower) without it",
  "hypothesis": "Adding cache fallback logic will improve system resilience"
}
```

**What This Means**: By regrouping elements into containers ("Critical Path" vs "Optional/Degradable"), a new insight emerges: if the cache is truly optional, there should be fallback logic. This architectural insight came from visual reorganization.

---

### Scenario 4: API Authentication Flow (Sequence Diagram)

**Context**: Documenting how components interact during user authentication to identify potential bottlenecks and security checkpoints.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "api-auth-flow",
  "diagramType": "sequenceDiagram",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elements": [
    {"id": "client", "type": "node", "label": "Client App", "properties": {}},
    {"id": "api", "type": "node", "label": "API Gateway", "properties": {}},
    {"id": "auth", "type": "node", "label": "Auth Service", "properties": {}},
    {"id": "db", "type": "node", "label": "Database", "properties": {}},
    {"id": "msg-1", "type": "edge", "source": "client", "target": "api", "label": "POST /login", "properties": {"arrowType": "->>"}},
    {"id": "msg-2", "type": "edge", "source": "api", "target": "auth", "label": "Validate credentials", "properties": {"arrowType": "->>"}},
    {"id": "msg-3", "type": "edge", "source": "auth", "target": "db", "label": "Query user", "properties": {"arrowType": "->>"}},
    {"id": "msg-4", "type": "edge", "source": "db", "target": "auth", "label": "User data", "properties": {"arrowType": "-->>"}},
    {"id": "msg-5", "type": "edge", "source": "auth", "target": "api", "label": "JWT token", "properties": {"arrowType": "-->>"}},
    {"id": "msg-6", "type": "edge", "source": "api", "target": "client", "label": "200 OK + token", "properties": {"arrowType": "-->>"}},
    {"id": "msg-7", "type": "edge", "source": "client", "target": "client", "label": "Store token", "properties": {"arrowType": "->>"}}
  ],
  "observation": "The authentication flow involves 4 components with 3 network hops before responding to the client"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "api-auth-flow",
  "diagramType": "sequenceDiagram",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elementCount": 11,
  "status": "success",
  "mermaidOutput": "sequenceDiagram\n    participant client as Client App\n    participant api as API Gateway\n    participant auth as Auth Service\n    participant db as Database\n    client->>api: POST /login\n    api->>auth: Validate credentials\n    auth->>db: Query user\n    db-->>auth: User data\n    auth-->>api: JWT token\n    api-->>client: 200 OK + token\n    client->>client: Store token"
}
```

**Mermaid Diagram**:
```mermaid
sequenceDiagram
    participant client as Client App
    participant api as API Gateway
    participant auth as Auth Service
    participant db as Database
    client->>api: POST /login
    api->>auth: Validate credentials
    auth->>db: Query user
    db-->>auth: User data
    auth-->>api: JWT token
    api-->>client: 200 OK + token
    client->>client: Store token
```

**What This Means**:
- **Participants**: Nodes become participants in the sequence (Client App, API Gateway, Auth Service, Database)
- **Message Flow**: Edges represent messages exchanged over time, top to bottom
- **Arrow Types**:
  - `->>` for synchronous requests (solid arrow)
  - `-->>` for asynchronous responses (dashed arrow)
- **Insight**: The visual reveals 3 network hops (Client → API → Auth → DB) before the user gets a response, which could impact latency
- **Self-messages**: The "Store token" message shows client-to-client interaction

---

### Scenario 5: Order Lifecycle (State Machine)

**Context**: Modeling the complete order lifecycle from creation to completion, including all possible states and transitions to understand the business process.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "order-lifecycle",
  "diagramType": "stateMachine",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elements": [
    {"id": "pending", "type": "node", "label": "Pending", "properties": {"isStart": true}},
    {"id": "paid", "type": "node", "label": "Paid", "properties": {}},
    {"id": "processing", "type": "node", "label": "Processing", "properties": {}},
    {"id": "shipped", "type": "node", "label": "Shipped", "properties": {}},
    {"id": "delivered", "type": "node", "label": "Delivered", "properties": {"isEnd": true}},
    {"id": "cancelled", "type": "node", "label": "Cancelled", "properties": {"isEnd": true}},
    {"id": "t1", "type": "edge", "source": "pending", "target": "paid", "label": "Payment confirmed", "properties": {}},
    {"id": "t2", "type": "edge", "source": "paid", "target": "processing", "label": "Order queued", "properties": {}},
    {"id": "t3", "type": "edge", "source": "processing", "target": "shipped", "label": "Shipped to carrier", "properties": {}},
    {"id": "t4", "type": "edge", "source": "shipped", "target": "delivered", "label": "Delivery confirmed", "properties": {}},
    {"id": "t5", "type": "edge", "source": "pending", "target": "cancelled", "label": "Payment failed", "properties": {}},
    {"id": "t6", "type": "edge", "source": "paid", "target": "cancelled", "label": "Customer cancelled", "properties": {}},
    {"id": "t7", "type": "edge", "source": "processing", "target": "cancelled", "label": "Out of stock", "properties": {}}
  ],
  "observation": "The order can be cancelled from multiple states (Pending, Paid, Processing) but not after shipping"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "order-lifecycle",
  "diagramType": "stateMachine",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elementCount": 13,
  "status": "success",
  "mermaidOutput": "stateDiagram-v2\n    [*] --> Pending\n    Pending --> Paid: Payment confirmed\n    Paid --> Processing: Order queued\n    Processing --> Shipped: Shipped to carrier\n    Shipped --> Delivered: Delivery confirmed\n    Pending --> Cancelled: Payment failed\n    Paid --> Cancelled: Customer cancelled\n    Processing --> Cancelled: Out of stock\n    Delivered --> [*]\n    Cancelled --> [*]"
}
```

**Mermaid Diagram**:
```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Paid: Payment confirmed
    Paid --> Processing: Order queued
    Processing --> Shipped: Shipped to carrier
    Shipped --> Delivered: Delivery confirmed
    Pending --> Cancelled: Payment failed
    Paid --> Cancelled: Customer cancelled
    Processing --> Cancelled: Out of stock
    Delivered --> [*]
    Cancelled --> [*]
```

**What This Means**:
- **Start State**: `[*] --> Pending` shows that all orders begin in the Pending state
- **End States**: Both `Delivered` and `Cancelled` lead to `[*]`, representing terminal states
- **Happy Path**: Pending → Paid → Processing → Shipped → Delivered
- **Cancellation Windows**:
  - From Pending (payment failed)
  - From Paid (customer cancellation)
  - From Processing (inventory issues)
- **Critical Insight**: Once an order reaches "Shipped" state, it cannot be cancelled - this is a business rule that's immediately visible in the state diagram
- **Transition Labels**: Each edge label describes the event or condition that triggers the state change
- **Business Logic**: The visual reveals that there's no path from Shipped back to any previous state, indicating a one-way progression after dispatch

---

### Scenario 6: E-Commerce Database Schema (Entity-Relationship Diagram)

**Context**: Designing a database schema for an e-commerce platform to understand entity relationships, attribute requirements, and cardinality constraints.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "ecommerce-schema",
  "diagramType": "erDiagram",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elements": [
    {"id": "User", "type": "node", "label": "User", "properties": {
      "attributes": [
        {"name": "id", "type": "int", "key": true},
        {"name": "email", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "created_at", "type": "timestamp"}
      ]
    }},
    {"id": "Order", "type": "node", "label": "Order", "properties": {
      "attributes": [
        {"name": "id", "type": "int", "key": true},
        {"name": "user_id", "type": "int"},
        {"name": "total", "type": "decimal"},
        {"name": "status", "type": "string"},
        {"name": "created_at", "type": "timestamp"}
      ]
    }},
    {"id": "Product", "type": "node", "label": "Product", "properties": {
      "attributes": [
        {"name": "id", "type": "int", "key": true},
        {"name": "name", "type": "string"},
        {"name": "price", "type": "decimal"},
        {"name": "stock", "type": "int"}
      ]
    }},
    {"id": "rel-1", "type": "edge", "label": "places", "source": "User", "target": "Order", "properties": {"cardinality": "||--o{"}},
    {"id": "rel-2", "type": "edge", "label": "contains", "source": "Order", "target": "Product", "properties": {"cardinality": "}o--o{"}},
    {"id": "rel-3", "type": "edge", "label": "views", "source": "User", "target": "Product", "properties": {"cardinality": "}o--o{"}}
  ],
  "observation": "The schema reveals a classic e-commerce pattern with User-Order-Product entities and both one-to-many and many-to-many relationships"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "ecommerce-schema",
  "diagramType": "erDiagram",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elementCount": 6,
  "status": "success",
  "mermaidOutput": "erDiagram\n    User {\n        int id PK\n        string email\n        string name\n        timestamp created_at\n    }\n    Order {\n        int id PK\n        int user_id\n        decimal total\n        string status\n        timestamp created_at\n    }\n    Product {\n        int id PK\n        string name\n        decimal price\n        int stock\n    }\n    User ||--o{ Order : places\n    Order }o--o{ Product : contains\n    User }o--o{ Product : views"
}
```

**Mermaid Diagram**:
```mermaid
erDiagram
    User {
        int id PK
        string email
        string name
        timestamp created_at
    }
    Order {
        int id PK
        int user_id
        decimal total
        string status
        timestamp created_at
    }
    Product {
        int id PK
        string name
        decimal price
        int stock
    }
    User ||--o{ Order : places
    Order }o--o{ Product : contains
    User }o--o{ Product : views
```

**What This Means**:
- **Entities as Nodes**: Each entity (User, Order, Product) becomes a table-like block in the diagram
- **Attributes with Types**: The `properties.attributes` array defines columns with data types (int, string, decimal, timestamp)
- **Primary Keys**: Attributes with `"key": true` are marked with `PK` suffix in the diagram
- **Relationship Cardinality**:
  - `||--o{` (one-to-many): User **places** Order - one user can place zero or many orders
  - `}o--o{` (many-to-many): Order **contains** Product - one order can contain many products, one product can be in many orders
  - `}o--o{` (many-to-many): User **views** Product - one user can view many products, one product can be viewed by many users
- **Foreign Keys**: The `user_id` in Order implicitly references User.id, establishing the one-to-many relationship
- **Data Type Insights**:
  - `decimal` for monetary values (price, total) ensures precision
  - `timestamp` for audit trail (created_at) enables temporal queries
  - `int` for stock enables inventory calculations
- **Schema Validation**: The visual reveals potential issues:
  - No OrderItem join table explicitly shown - the many-to-many relationship between Order and Product likely needs an intermediate table with quantity and price_at_purchase
  - No indexes indicated - might want to index foreign keys (user_id) and frequently queried fields (status, email)
- **Business Logic**: The "views" relationship suggests product analytics tracking, separate from purchase behavior

**Design Considerations**:
- To properly implement the Order-Product many-to-many, you'd typically add an `OrderItem` entity with order_id, product_id, quantity, and unit_price
- Consider adding a `payment_method` field to Order for transaction tracking
- The `stock` field in Product suggests inventory management - you might need stock alerts or reserved quantities

---

### Scenario 7: Feature Brainstorming (Mind Map)

**Context**: Planning features for a mobile app v2.0 release using a mind map to organize ideas hierarchically, group related features, and visualize the feature tree from central concept to implementation details.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "feature-brainstorm",
  "diagramType": "mindMap",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elements": [
    {"id": "mobile-app", "type": "node", "label": "Mobile App v2.0", "properties": {"isRoot": true, "shape": "circle"}, "contains": ["auth", "social", "analytics"]},
    {"id": "auth", "type": "node", "label": "Authentication", "properties": {"shape": "square"}, "contains": ["biometric", "sso"]},
    {"id": "biometric", "type": "node", "label": "Biometric Login", "properties": {}},
    {"id": "sso", "type": "node", "label": "SSO Integration", "properties": {}},
    {"id": "social", "type": "node", "label": "Social Features", "properties": {"shape": "square"}, "contains": ["sharing", "friends", "chat"]},
    {"id": "sharing", "type": "node", "label": "Content Sharing", "properties": {}},
    {"id": "friends", "type": "node", "label": "Friend Network", "properties": {}},
    {"id": "chat", "type": "node", "label": "Real-time Chat", "properties": {}},
    {"id": "analytics", "type": "node", "label": "Analytics", "properties": {"shape": "square"}, "contains": ["tracking", "reports"]},
    {"id": "tracking", "type": "node", "label": "Event Tracking", "properties": {}},
    {"id": "reports", "type": "node", "label": "User Reports", "properties": {}}
  ],
  "observation": "The mind map reveals three major feature pillars (Authentication, Social, Analytics) with clear implementation sub-tasks under each category"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "feature-brainstorm",
  "diagramType": "mindMap",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elementCount": 11,
  "status": "success",
  "mermaidOutput": "mindmap\n  root((Mobile App v2.0))\n    [Authentication]\n      Biometric Login\n      SSO Integration\n    [Social Features]\n      Content Sharing\n      Friend Network\n      Real-time Chat\n    [Analytics]\n      Event Tracking\n      User Reports"
}
```

**Mermaid Diagram**:
```mermaid
mindmap
  root((Mobile App v2.0))
    [Authentication]
      Biometric Login
      SSO Integration
    [Social Features]
      Content Sharing
      Friend Network
      Real-time Chat
    [Analytics]
      Event Tracking
      User Reports
```

**What This Means**:
- **Root Node**: `Mobile App v2.0` is the central concept, marked with `isRoot: true` and rendered as a circle `(( ))` in Mermaid
- **Hierarchical Structure**: The `contains` array defines parent-child relationships without explicit edges
  - Level 1: Three main feature categories (Authentication, Social Features, Analytics)
  - Level 2: Specific implementations under each category
- **Visual Shapes**:
  - Circle `(( ))` for the root - the main product/concept
  - Square `[ ]` for major feature categories - organizational grouping
  - Plain text for leaf nodes - concrete implementation tasks
- **Feature Distribution**:
  - Authentication: 2 sub-features (Biometric, SSO)
  - Social Features: 3 sub-features (Sharing, Friends, Chat)
  - Analytics: 2 sub-features (Tracking, Reports)
- **Critical Insights**:
  - Social features dominate with 3 implementations - likely the differentiator for v2.0
  - Authentication improvements focus on user convenience (biometric) and enterprise adoption (SSO)
  - Analytics is scoped to essential tracking and reporting - not overbuilt
- **Scope Clarity**: The visual immediately shows that v2.0 has 7 concrete implementation tasks across 3 pillars - helps with sprint planning and effort estimation
- **Cross-cutting Concerns**: Notice that "Event Tracking" in Analytics likely needs integration with all other features (auth events, social interactions, etc.)

**Brainstorming Strategy**:
- **Radial Organization**: Ideas branch outward from the center, making it easy to add new categories or expand existing ones
- **Depth vs. Breadth**: The current structure is 2 levels deep - consider if any leaf nodes need further breakdown (e.g., "Biometric Login" might expand to "Face ID", "Fingerprint", "Voice Recognition")
- **Missing Branches**: The mind map might reveal gaps - for example, no "Performance" or "Security" categories despite adding social features that could impact both
- **Prioritization**: Main branches (square nodes) can be color-coded or numbered in future iterations to indicate development priority

**Practical Use Cases**:
- **Product Planning**: Visualize feature scope for stakeholder presentations
- **Sprint Planning**: Each leaf node becomes a potential user story or task
- **Team Alignment**: Shared visual helps cross-functional teams understand the full feature landscape
- **Dependency Discovery**: Realize that SSO Integration might affect both Authentication and Social Features (single sign-on for friend connections)
- **Gap Analysis**: Missing node like "Onboarding" or "Settings" becomes obvious when you see the overall structure

---

### Scenario 8: E-Commerce System Context (C4 Context Diagram)

**Context**: Documenting the high-level system architecture to understand external actors, internal systems, and dependencies using the C4 model's System Context level.

**Input**:
```json
{
  "operation": "create",
  "diagramId": "ecommerce-context",
  "diagramType": "contextDiagram",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elements": [
    {"id": "customer", "type": "node", "label": "Customer", "properties": {"nodeType": "Person", "description": "End user who browses and purchases products"}},
    {"id": "admin", "type": "node", "label": "Admin", "properties": {"nodeType": "Person", "description": "Staff managing inventory and orders"}},
    {"id": "ecommerce", "type": "node", "label": "E-Commerce Platform", "properties": {"nodeType": "System", "description": "Online shopping platform with cart, checkout, and order management"}},
    {"id": "inventory", "type": "node", "label": "Inventory Service", "properties": {"nodeType": "System", "description": "Manages product catalog and stock levels"}},
    {"id": "payment", "type": "node", "label": "Payment Gateway", "properties": {"nodeType": "System_Ext", "description": "External payment processor (Stripe/PayPal)"}},
    {"id": "shipping", "type": "node", "label": "Shipping Provider", "properties": {"nodeType": "System_Ext", "description": "External logistics service (FedEx/UPS)"}},
    {"id": "email", "type": "node", "label": "Email Service", "properties": {"nodeType": "System_Ext", "description": "Transactional email provider (SendGrid)"}},
    {"id": "rel-1", "type": "edge", "source": "customer", "target": "ecommerce", "label": "Browses products, places orders", "properties": {"technology": "HTTPS/REST"}},
    {"id": "rel-2", "type": "edge", "source": "admin", "target": "ecommerce", "label": "Manages products, views orders", "properties": {"technology": "HTTPS/Admin Portal"}},
    {"id": "rel-3", "type": "edge", "source": "ecommerce", "target": "inventory", "label": "Checks stock, reserves items", "properties": {"technology": "gRPC"}},
    {"id": "rel-4", "type": "edge", "source": "ecommerce", "target": "payment", "label": "Processes payments", "properties": {"technology": "HTTPS/REST API"}},
    {"id": "rel-5", "type": "edge", "source": "ecommerce", "target": "shipping", "label": "Creates shipping labels", "properties": {"technology": "HTTPS/REST API"}},
    {"id": "rel-6", "type": "edge", "source": "ecommerce", "target": "email", "label": "Sends order confirmations", "properties": {"technology": "SMTP/API"}}
  ],
  "observation": "The system has 2 user types, 2 internal systems, and 3 external dependencies - payment, shipping, and email services"
}
```

**Output**:
```json
{
  "operation": "create",
  "diagramId": "ecommerce-context",
  "diagramType": "contextDiagram",
  "iteration": 1,
  "nextOperationNeeded": false,
  "elementCount": 13,
  "status": "success",
  "mermaidOutput": "C4Context\n    title System Context diagram for E-Commerce Platform\n\n    Person(customer, \"Customer\", \"End user who browses and purchases products\")\n    Person(admin, \"Admin\", \"Staff managing inventory and orders\")\n    System(ecommerce, \"E-Commerce Platform\", \"Online shopping platform with cart, checkout, and order management\")\n    System(inventory, \"Inventory Service\", \"Manages product catalog and stock levels\")\n    System_Ext(payment, \"Payment Gateway\", \"External payment processor (Stripe/PayPal)\")\n    System_Ext(shipping, \"Shipping Provider\", \"External logistics service (FedEx/UPS)\")\n    System_Ext(email, \"Email Service\", \"Transactional email provider (SendGrid)\")\n\n    Rel(customer, ecommerce, \"Browses products, places orders\", \"HTTPS/REST\")\n    Rel(admin, ecommerce, \"Manages products, views orders\", \"HTTPS/Admin Portal\")\n    Rel(ecommerce, inventory, \"Checks stock, reserves items\", \"gRPC\")\n    Rel(ecommerce, payment, \"Processes payments\", \"HTTPS/REST API\")\n    Rel(ecommerce, shipping, \"Creates shipping labels\", \"HTTPS/REST API\")\n    Rel(ecommerce, email, \"Sends order confirmations\", \"SMTP/API\")"
}
```

**Mermaid Diagram**:
```mermaid
C4Context
    title System Context diagram for E-Commerce Platform

    Person(customer, "Customer", "End user who browses and purchases products")
    Person(admin, "Admin", "Staff managing inventory and orders")
    System(ecommerce, "E-Commerce Platform", "Online shopping platform with cart, checkout, and order management")
    System(inventory, "Inventory Service", "Manages product catalog and stock levels")
    System_Ext(payment, "Payment Gateway", "External payment processor (Stripe/PayPal)")
    System_Ext(shipping, "Shipping Provider", "External logistics service (FedEx/UPS)")
    System_Ext(email, "Email Service", "Transactional email provider (SendGrid)")

    Rel(customer, ecommerce, "Browses products, places orders", "HTTPS/REST")
    Rel(admin, ecommerce, "Manages products, views orders", "HTTPS/Admin Portal")
    Rel(ecommerce, inventory, "Checks stock, reserves items", "gRPC")
    Rel(ecommerce, payment, "Processes payments", "HTTPS/REST API")
    Rel(ecommerce, shipping, "Creates shipping labels", "HTTPS/REST API")
    Rel(ecommerce, email, "Sends order confirmations", "SMTP/API")
```

**What This Means**:
- **C4 Context Level**: This diagram shows the system boundary and external interactions using the C4 model convention
- **Node Types**:
  - `Person`: External actors (Customer, Admin) who interact with the system
  - `System`: Internal software systems under your control (E-Commerce Platform, Inventory Service)
  - `System_Ext`: External systems/services you depend on but don't control (Payment, Shipping, Email)
- **System Boundary**: The `System` nodes (E-Commerce Platform, Inventory Service) represent what your team builds and maintains
- **External Dependencies**: Three critical external dependencies:
  - **Payment Gateway** - Financial transactions (vendor lock-in risk)
  - **Shipping Provider** - Physical logistics (operational dependency)
  - **Email Service** - Customer communications (deliverability dependency)
- **Relationships (Rel)**:
  - Each `Rel()` shows the interaction between components with a description and technology
  - Technology parameter reveals the integration method (REST API, gRPC, SMTP)
- **Actor Insights**:
  - **Customer**: Single entry point to the E-Commerce Platform - no direct access to internal systems
  - **Admin**: Uses separate portal/interface - suggests role-based access control
- **Integration Patterns**:
  - Internal communication uses gRPC (ecommerce → inventory) - high performance needed
  - External APIs all use HTTPS/REST - standard integration pattern
  - Email uses SMTP/API - transactional messaging pattern

**Dependency Analysis**:
- **Critical Path**: Customer → E-Commerce → Payment is the revenue-generating flow - must be highly available
- **Failure Modes**:
  - If Payment Gateway is down → cannot process orders (need fallback provider?)
  - If Shipping Provider is down → cannot fulfill orders (need multi-carrier support?)
  - If Email Service is down → silent failures (need retry queue and monitoring)
- **Vendor Lock-in**: All three external systems are vendor-specific - consider abstraction layers for easier migration
- **Data Flow**: The diagram reveals that customer data flows to three external parties (Payment, Shipping, Email) - compliance implications for GDPR, PCI-DSS

**Architecture Decisions**:
- **Microservices**: E-Commerce Platform and Inventory Service are separate systems - suggests service-oriented architecture
- **Technology Choices**: gRPC for internal, REST for external - indicates performance optimization for internal calls
- **Security Boundaries**: Admin has different access path - likely separate authentication/authorization mechanism

**Scaling Considerations**:
- External systems (Payment, Shipping, Email) have their own rate limits and SLAs - need circuit breakers
- Inventory Service is separate from E-Commerce Platform - can scale independently based on read/write patterns
- No database shown at this level - Context diagrams focus on system boundaries, not implementation details

**Next Steps with C4**:
- **Container Diagram**: Drill down into E-Commerce Platform to show web app, API, database
- **Component Diagram**: Detail the internal structure of critical containers
- **Code Diagram**: Show class/module relationships for specific components

---

## Rendering Mermaid Diagrams

All Map tool diagrams output **Mermaid syntax** in the `mermaidOutput` field. Mermaid is a text-based diagramming format that can be rendered in many tools and platforms. Here's how to visualize your diagrams:

### 1. Online Editors (Quickest)

**Mermaid Live Editor** - [https://mermaid.live](https://mermaid.live)

The fastest way to see your diagram. Simply copy the `mermaidOutput` value and paste it into the editor.

**Example**:
1. Run the Map tool and get the `mermaidOutput` value
2. Visit [mermaid.live](https://mermaid.live)
3. Paste the Mermaid syntax into the code editor
4. View the rendered diagram instantly
5. Export as SVG/PNG if needed

**Other online options**:
- [Mermaid Chart](https://www.mermaidchart.com/) - Professional diagramming with collaboration features
- [Kroki](https://kroki.io/) - Supports Mermaid and many other formats

---

### 2. GitHub Markdown (Native Rendering)

GitHub automatically renders Mermaid diagrams in markdown files, issues, pull requests, and discussions. Just wrap the syntax in a mermaid code block:

**Example**:
````markdown
```mermaid
sequenceDiagram
    participant client as Client App
    participant api as API Gateway
    client->>api: POST /login
    api-->>client: 200 OK + token
```
````

**Renders as**:
```mermaid
sequenceDiagram
    participant client as Client App
    participant api as API Gateway
    client->>api: POST /login
    api-->>client: 200 OK + token
```

**Supported in**:
- GitHub README.md files
- GitHub Issues and Pull Requests
- GitHub Discussions
- GitHub Wiki
- GitLab (also supports Mermaid)

---

### 3. VS Code Extensions (Interactive Development)

**Recommended Extensions**:

**Mermaid Editor** (tomoyukim.vscode-mermaid-editor)
- Live preview as you type
- Export to SVG/PNG
- Syntax highlighting

**Installation**:
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "Mermaid Editor"
4. Click Install

**Usage**:
1. Create a `.mmd` file or markdown file
2. Paste your Mermaid syntax
3. Right-click → "Open Mermaid Preview"
4. View live preview side-by-side

**Markdown Preview Mermaid Support** (bierner.markdown-mermaid)
- Renders Mermaid in markdown preview
- Works with existing markdown workflow
- No separate preview command needed

---

### 4. Command-Line (mermaid-cli)

For automated workflows, CI/CD pipelines, or batch processing, use **mermaid-cli** to generate images from the command line.

**Installation**:
```bash
# Using npm
npm install -g @mermaid-js/mermaid-cli

# Using yarn
yarn global add @mermaid-js/mermaid-cli

# Using Docker
docker pull minlag/mermaid-cli
```

**Usage**:
```bash
# Save Mermaid syntax to a file
echo 'sequenceDiagram
    participant A
    participant B
    A->>B: Hello' > diagram.mmd

# Generate PNG
mmdc -i diagram.mmd -o diagram.png

# Generate SVG (better for scaling)
mmdc -i diagram.mmd -o diagram.svg

# Generate PDF
mmdc -i diagram.mmd -o diagram.pdf

# With custom theme
mmdc -i diagram.mmd -o diagram.svg -t dark

# Set background color
mmdc -i diagram.mmd -o diagram.png -b transparent
```

**Advanced Options**:
```bash
# Set width/height
mmdc -i diagram.mmd -o diagram.png -w 1200 -H 800

# Custom CSS
mmdc -i diagram.mmd -o diagram.svg -C custom.css

# Configuration file
mmdc -i diagram.mmd -o diagram.svg -c config.json
```

**CI/CD Integration** (GitHub Actions):
```yaml
name: Generate Diagrams
on: [push]
jobs:
  diagrams:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate diagrams
        uses: neenjaw/compile-mermaid-markdown-action@v0.3.0
        with:
          files: 'docs/**/*.md'
          output: 'diagrams'
```

---

### 5. Jupyter Notebooks

For data science and research workflows, render Mermaid in Jupyter notebooks:

**Using IPython magic**:
```python
from IPython.display import display, Markdown

mermaid_code = """
```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
"""

display(Markdown(mermaid_code))
```

**Using py-mermaid-js**:
```python
# Install: pip install py-mermaid-js
from mermaid import Mermaid

diagram = """
graph TD
    A[Start] --> B[Process]
"""

Mermaid(diagram)
```

---

### 6. Documentation Sites

**MkDocs** (with pymdown-extensions):
```yaml
# mkdocs.yml
markdown_extensions:
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
```

**Docusaurus**:
```bash
# Install plugin
npm install --save @docusaurus/theme-mermaid

# Add to docusaurus.config.js
module.exports = {
  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },
};
```

**Sphinx** (using sphinxcontrib-mermaid):
```bash
# Install
pip install sphinxcontrib-mermaid

# Add to conf.py
extensions = ['sphinxcontrib.mermaid']
```

---

### 7. Notion, Confluence, and Other Tools

**Notion**:
- Create a Code block
- Set language to "Mermaid"
- Paste your Mermaid syntax
- Notion renders it automatically

**Confluence**:
- Install "Mermaid Diagrams for Confluence" app from Marketplace
- Use the `/mermaid` macro
- Paste syntax and save

**Obsidian**:
- Native Mermaid support
- Use code blocks with `mermaid` language
- Renders in preview mode

---

### Rendering Example Workflow

Here's a complete workflow from Map tool output to rendered diagram:

**Step 1: Get Mermaid Output**
```json
{
  "operation": "create",
  "diagramType": "sequenceDiagram",
  "status": "success",
  "mermaidOutput": "sequenceDiagram\n    participant client as Client App\n    participant api as API Gateway\n    client->>api: POST /login\n    api-->>client: 200 OK"
}
```

**Step 2: Extract the mermaidOutput**
```
sequenceDiagram
    participant client as Client App
    participant api as API Gateway
    client->>api: POST /login
    api-->>client: 200 OK
```

**Step 3: Choose your rendering method**:
- **Quick preview**: Paste into [mermaid.live](https://mermaid.live)
- **Documentation**: Add to GitHub markdown in README.md
- **Development**: Open in VS Code with Mermaid extension
- **Production**: Generate SVG/PNG with `mmdc -i diagram.mmd -o diagram.svg`
- **Presentation**: Export from mermaid.live as PNG or SVG

**Step 4: Customize (optional)**
```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#ff0000'}}}%%
sequenceDiagram
    participant client as Client App
    participant api as API Gateway
    client->>api: POST /login
    api-->>client: 200 OK
```

---

### Troubleshooting

**Diagram doesn't render**:
- Check for syntax errors (missing semicolons, incorrect node IDs)
- Validate at [mermaid.live](https://mermaid.live)
- Ensure the Mermaid version supports your diagram type (e.g., mindmap requires v9.3+)

**Styling issues**:
- Use `%%{init: {}}%%` header for theme configuration
- Custom CSS with mermaid-cli: `mmdc -C custom.css`
- GitHub uses default theme (limited customization)

**Performance with large diagrams**:
- SVG format is better for complex diagrams than PNG
- Consider splitting large diagrams into smaller components
- Use containers/subgraphs to organize complex relationships

**Browser compatibility**:
- Modern browsers (Chrome, Firefox, Safari, Edge) fully support Mermaid
- IE11 not supported (use static images instead)

---

## User Experience

Map produces visual structure records:

| Field | What It Tells You |
|-------|-------------------|
| `operation` | What action was performed |
| `diagramId` | Unique identifier for this diagram |
| `diagramType` | What kind of visualization |
| `iteration` | How many modifications |
| `nextOperationNeeded` | Whether to continue building |
| `elementCount` | Number of elements in the diagram |
| `elements` | Nodes, edges, containers, annotations |
| `observation` | What you notice from the visual |
| `insight` | New understanding gained |
| `hypothesis` | Testable idea emerging from the visual |

**Building Flow**:
```
Create → Add nodes/edges → Transform (regroup, recolor) → Observe insights → Iterate
```

## Integration Tips

- **Start simple** - Add elements iteratively rather than all at once
- **Use properties for meaning** - Colors, shapes, and layers encode information
- **Group related elements** - Containers reveal structure
- **Record observations** - The insight field captures what you learn
- **Transform to see differently** - Regrouping reveals hidden patterns
- **Chain with Trace** - Use Trace to reason about what the diagram shows
- **Chain with Hypothesis** - Visual insights become testable hypotheses

## Quick Reference

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | Yes | create, update, delete, transform, observe |
| `diagramId` | string | Yes | Unique identifier |
| `diagramType` | enum | Yes | flowchart, stateDiagram, conceptMap, treeDiagram, graph, sequenceDiagram, stateMachine, erDiagram, mindMap, contextDiagram, custom |
| `iteration` | number | Yes | Current iteration count |
| `nextOperationNeeded` | boolean | Yes | Whether to continue |
| `elements` | array | No | Nodes, edges, containers with id, type, label, properties |
| `transformationType` | enum | No | rotate, move, resize, recolor, regroup |
| `observation` | string | No | What you notice |
| `insight` | string | No | New understanding |
| `hypothesis` | string | No | Testable idea |
| `mermaidOutput` | string | No | Generated Mermaid diagram syntax (automatically included) |
