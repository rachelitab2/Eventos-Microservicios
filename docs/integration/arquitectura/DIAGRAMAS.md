# 📊 DIAGRAMAS DE ARQUITECTURA — EVENTOS MICROSERVICIOS

> Documentación técnica completa: diagramas de sistema, base de datos, flujos y Git.

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

```mermaid
graph TB
    subgraph "Cliente"
        USER["👤 Usuario Final"]
        BROWSER["🌐 Navegador Web"]
    end

    subgraph "Frontend — Puerto 5173"
        FE["⚛️ frontend-v2\nReact 19 + TypeScript + Vite"]
    end

    subgraph "API Gateway — Puerto 8080"
        GW["🔀 API Gateway\nSpring Cloud Gateway"]
    end

    subgraph "Microservicios Backend"
        AUTH["🔐 auth-service\nPuerto 8081\nJWT + Login/Register"]
        USER_SVC["👤 user-service\nPuerto 8082\nPerfiles de Usuario"]
        EVENT["📅 event-service\nPuerto 8083\nGestión de Eventos"]
        INSCRIP["📋 inscrip-service\nPuerto 8084\nInscripciones"]
        NOTIF["📧 notification-service\nPuerto 8085\nEmails"]
    end

    subgraph "Base de Datos — Railway MySQL"
        AUTH_DB[("🗄️ auth_db")]
        USER_DB[("🗄️ user_db")]
        EVENT_DB[("🗄️ event_db")]
        INSCRIP_DB[("🗄️ inscrip_db")]
        NOTIF_DB[("🗄️ notification_db")]
    end

    subgraph "Servicios Externos"
        GMAIL["📬 Gmail API"]
        SMTP["📧 SMTP Gmail"]
        SENDGRID["📨 SendGrid"]
    end

    USER --> BROWSER
    BROWSER --> FE
    FE -->|"/api/* (proxy Vite)"| GW

    GW -->|"/auth/**"| AUTH
    GW -->|"/users/**"| USER_SVC
    GW -->|"/events/**"| EVENT
    GW -->|"/inscriptions/**"| INSCRIP
    GW -->|"/notifications/**"| NOTIF

    AUTH --- AUTH_DB
    USER_SVC --- USER_DB
    EVENT --- EVENT_DB
    INSCRIP --- INSCRIP_DB
    NOTIF --- NOTIF_DB

    NOTIF --> GMAIL
    NOTIF --> SMTP
    NOTIF --> SENDGRID

    style FE fill:#61dafb,color:#000
    style GW fill:#ff6b35,color:#fff
    style AUTH fill:#4ecdc4,color:#000
    style USER_SVC fill:#45b7d1,color:#000
    style EVENT fill:#96ceb4,color:#000
    style INSCRIP fill:#ffeaa7,color:#000
    style NOTIF fill:#dda0dd,color:#000
```

---

## 2. DIAGRAMA DE FLUJO — REGISTRO E INSCRIPCIÓN

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend (5173)
    participant GW as Gateway (8080)
    participant AUTH as auth-service (8081)
    participant EVENT as event-service (8083)
    participant INSCRIP as inscrip-service (8084)
    participant NOTIF as notification-service (8085)
    participant DB as Railway MySQL

    Note over U,DB: FLUJO 1: Registro de Usuario
    U->>FE: Llena formulario de registro
    FE->>GW: POST /auth/register
    GW->>AUTH: POST /auth/register
    AUTH->>DB: INSERT INTO auth_db.users
    AUTH-->>GW: { token: "JWT...", user: {...} }
    GW-->>FE: 200 OK + JWT Token
    FE-->>U: Redirige a Home

    Note over U,DB: FLUJO 2: Login
    U->>FE: Ingresa credenciales
    FE->>GW: POST /auth/login
    GW->>AUTH: POST /auth/login
    AUTH->>DB: SELECT user WHERE email=?
    AUTH-->>GW: { token: "JWT...", userId: 123 }
    GW-->>FE: 200 OK + JWT Token
    FE-->>U: Muestra dashboard

    Note over U,DB: FLUJO 3: Inscripción a Evento
    U->>FE: Clic "Inscribirme"
    FE->>GW: POST /inscriptions (JWT en header)
    GW->>INSCRIP: POST /inscriptions
    INSCRIP->>DB: SELECT capacity FROM event_db (validar cupo)
    INSCRIP->>DB: INSERT INTO inscrip_db.inscriptions
    INSCRIP->>NOTIF: POST /notifications/send (confirmación)
    NOTIF->>DB: INSERT INTO notification_db
    NOTIF-->>INSCRIP: Email enviado
    INSCRIP-->>GW: { inscriptionId: 456, status: "CONFIRMED" }
    GW-->>FE: 201 Created
    FE-->>U: "¡Inscripción exitosa!" (Toast)
```

---

## 3. DIAGRAMA ENTIDAD-RELACIÓN (BASE DE DATOS)

```mermaid
erDiagram
    %% ====== auth_db ======
    USERS {
        bigint id PK
        varchar email UK "NOT NULL"
        varchar password "BCrypt hash"
        varchar name
        varchar role "USER / ADMIN"
        datetime created_at
    }

    %% ====== user_db ======
    USER_PROFILES {
        bigint id PK
        bigint user_id UK "FK → auth_db.users.id (lógico)"
        varchar display_name
        varchar avatar_url
        varchar bio
        varchar phone
        datetime updated_at
    }

    %% ====== event_db ======
    EVENTS {
        bigint id PK
        varchar title "NOT NULL"
        text description
        varchar location
        datetime event_date "NOT NULL"
        int capacity "NOT NULL"
        int enrolled "DEFAULT 0"
        varchar category
        varchar image_url
        varchar status "ACTIVE / CANCELLED / FULL"
        bigint created_by "userId del organizador"
        datetime created_at
    }

    COMMENTS {
        bigint id PK
        bigint event_id FK
        bigint user_id
        varchar user_name
        text content "NOT NULL"
        datetime created_at
    }

    %% ====== inscrip_db ======
    INSCRIPTIONS {
        bigint id PK
        bigint event_id "FK lógico → event_db.events.id"
        bigint user_id "FK lógico → auth_db.users.id"
        varchar status "CONFIRMED / CANCELLED / PENDING"
        datetime inscription_date
        datetime cancelled_at
    }

    %% ====== notification_db ======
    NOTIFICATIONS {
        bigint id PK
        bigint user_id
        varchar recipient_email "NOT NULL"
        varchar subject
        text body
        varchar type "INSCRIPTION / CANCELLATION / REMINDER"
        varchar status "SENT / FAILED / PENDING"
        datetime sent_at
        datetime created_at
    }

    %% Relaciones lógicas (servicios separados — sin FK real entre DBs)
    EVENTS ||--o{ COMMENTS : "tiene"
    EVENTS ||--o{ INSCRIPTIONS : "tiene"
    USERS ||--o{ INSCRIPTIONS : "realiza"
    USERS ||--|| USER_PROFILES : "tiene"
    USERS ||--o{ NOTIFICATIONS : "recibe"
```

---

## 4. DIAGRAMA DE COMPONENTES — TECNOLOGÍA

```mermaid
graph LR
    subgraph "Frontend Layer"
        VITE["Vite 8.0\nDev Server"]
        REACT["React 19\n+ TypeScript"]
        ROUTER["React Router 7"]
        FRAMER["Framer Motion"]
        LUCIDE["Lucide Icons"]
    end

    subgraph "Gateway Layer"
        SPRING_GW["Spring Cloud\nGateway WebMVC\n2025.0.1"]
        CORS["CorsConfig"]
    end

    subgraph "Service Layer"
        SPRING_BOOT["Spring Boot 3.5.11\nJava 17"]
        JPA["Spring Data JPA\n+ Hibernate"]
        SECURITY["Spring Security\n+ JWT"]
        MAIL["Spring Mail\n+ JavaMail"]
    end

    subgraph "Data Layer"
        MYSQL["MySQL 8.4\n(Railway Cloud)"]
        DOCKER["Docker\n(local dev)"]
    end

    subgraph "External Services"
        GMAIL_API["Gmail API\n(OAuth2)"]
        SENDGRID_API["SendGrid API"]
        SMTP_GMAIL["SMTP\nGmail"]
    end

    REACT --> VITE
    REACT --> ROUTER
    REACT --> FRAMER
    REACT --> LUCIDE
    VITE -->|"proxy /api"| SPRING_GW
    SPRING_GW --> CORS
    SPRING_GW --> SPRING_BOOT
    SPRING_BOOT --> JPA
    SPRING_BOOT --> SECURITY
    SPRING_BOOT --> MAIL
    JPA --> MYSQL
    MYSQL --> DOCKER
    MAIL --> GMAIL_API
    MAIL --> SENDGRID_API
    MAIL --> SMTP_GMAIL
```

---

## 5. FLUJO DE TRABAJO GIT

```mermaid
gitGraph
    commit id: "Initial commit"

    branch develop
    checkout develop
    commit id: "Setup develop"

    branch feature/francisco-scripts
    checkout feature/francisco-scripts
    commit id: "feat: Start-All.ps1"
    commit id: "feat: Stop-All.ps1"
    commit id: "feat: Monitor + BAT"

    checkout develop
    merge feature/francisco-scripts id: "Merge: Scripts ✓"

    branch feature/rachel-auth-service
    checkout feature/rachel-auth-service
    commit id: "feat: auth-service"
    commit id: "feat: notification-service"

    checkout develop
    merge feature/rachel-auth-service id: "Merge: Auth ✓"

    branch feature/andrea-user-gateway
    checkout feature/andrea-user-gateway
    commit id: "feat: user-service"
    commit id: "feat: gateway routes"

    checkout develop
    merge feature/andrea-user-gateway id: "Merge: Gateway ✓"

    branch feature/braylin-event-service
    checkout feature/braylin-event-service
    commit id: "feat: event CRUD"
    commit id: "feat: comments system"

    checkout develop
    merge feature/braylin-event-service id: "Merge: Events ✓"

    branch feature/eliana-inscrip-frontend
    checkout feature/eliana-inscrip-frontend
    commit id: "feat: inscrip-service"
    commit id: "feat: frontend-v2 SPA"

    checkout develop
    merge feature/eliana-inscrip-frontend id: "Merge: Frontend ✓"

    checkout main
    merge develop id: "Release v1.0.0 🚀"
```

---

## 6. DIAGRAMA DE ESTADOS — INSCRIPCIÓN

```mermaid
stateDiagram-v2
    [*] --> Disponible : Evento creado

    Disponible --> Inscrito : Usuario se inscribe\n(POST /inscriptions)
    Disponible --> Lleno : capacity == enrolled

    Lleno --> Disponible : Alguien cancela\n(enrolled decreases)

    Inscrito --> Cancelado : Usuario cancela\n(DELETE /inscriptions/{id})
    Cancelado --> Inscrito : Usuario re-inscribe
    Cancelado --> [*] : Evento finaliza

    Inscrito --> Confirmado : Email enviado\n(notification-service)
    Confirmado --> [*] : Evento finaliza

    state "Inscrito" {
        [*] --> Pendiente
        Pendiente --> EmailEnviado : Notificación OK
        Pendiente --> ErrorEmail : Falla de email
        ErrorEmail --> EmailEnviado : Reintento exitoso
    }
```

---

## 7. MAPA DE ENDPOINTS — API COMPLETA

```mermaid
graph LR
    subgraph "AUTH /auth/**"
        A1["POST /auth/register"]
        A2["POST /auth/login"]
        A3["GET /auth/health"]
    end

    subgraph "USERS /users/**"
        U1["GET /users/:userId"]
        U2["POST /users"]
        U3["PUT /users/:userId"]
        U4["DELETE /users/:userId"]
        U5["GET /users/health"]
    end

    subgraph "EVENTS /events/**"
        E1["GET /events"]
        E2["GET /events/:id"]
        E3["POST /events"]
        E4["PUT /events/:id"]
        E5["DELETE /events/:id"]
        E6["GET /events/:id/comments"]
        E7["POST /events/:id/comments"]
        E8["GET /events/health"]
    end

    subgraph "INSCRIPTIONS /inscriptions/**"
        I1["GET /inscriptions"]
        I2["GET /inscriptions/:id"]
        I3["GET /inscriptions/user/:userId"]
        I4["POST /inscriptions"]
        I5["DELETE /inscriptions/:id"]
        I6["GET /inscriptions/health"]
    end

    subgraph "NOTIFICATIONS /notifications/**"
        N1["POST /notifications/send"]
        N2["GET /notifications/health"]
    end

    GW["🔀 Gateway\n:8080"] --> A1 & A2 & A3
    GW --> U1 & U2 & U3 & U4 & U5
    GW --> E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8
    GW --> I1 & I2 & I3 & I4 & I5 & I6
    GW --> N1 & N2
```

---

## 8. INFRAESTRUCTURA DE DESPLIEGUE

```mermaid
graph TB
    subgraph "Local Development"
        DEV_FE["frontend-v2\nlocalhost:5173"]
        DEV_GW["gateway\nlocalhost:8080"]
        DEV_AUTH["auth-service\nlocalhost:8081"]
        DEV_USER["user-service\nlocalhost:8082"]
        DEV_EVENT["event-service\nlocalhost:8083"]
        DEV_INSCRIP["inscrip-service\nlocalhost:8084"]
        DEV_NOTIF["notification-service\nlocalhost:8085"]
        DEV_MYSQL[("MySQL Docker\nlocalhost:3306")]
    end

    subgraph "Railway Cloud Production"
        PROD_FE["frontend-v2\nfrontend-production-5e8b.up.railway.app"]
        PROD_GW["gateway\ngateway-production-69b3.up.railway.app"]
        PROD_MYSQL[("Railway MySQL\nshinkansen.proxy.rlwy.net:37791")]
    end

    subgraph "External Email"
        GMAIL_CLOUD["Gmail API\nOAuth2"]
    end

    DEV_FE -->|"proxy /api"| DEV_GW
    DEV_GW --> DEV_AUTH & DEV_USER & DEV_EVENT & DEV_INSCRIP & DEV_NOTIF
    DEV_AUTH & DEV_USER & DEV_EVENT & DEV_INSCRIP & DEV_NOTIF --> DEV_MYSQL

    PROD_FE -->|"HTTPS"| PROD_GW
    PROD_GW -->|"Railway internal"| PROD_MYSQL
    PROD_NOTIF["notification-service\nRailway"] --> GMAIL_CLOUD
```

---

## 9. RESUMEN DE RESPONSABILIDADES

```mermaid
pie title Distribución de Componentes por Persona
    "Rachel (auth + notif)" : 2
    "Braylin (event)" : 1
    "Andrea (user + gateway)" : 2
    "Eliana (inscrip + frontend)" : 2
    "Francisco (scripts)" : 1
```

---

*Documentación técnica generada: 2026-03-13 | Proyecto: Eventos-Microservicios*
