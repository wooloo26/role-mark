# Role Mark

- **Project Type**: Full-stack web application (with SSR), portal website requiring aesthetically pleasing design
- **Core Objective**: Build a website supporting management of characters, resources, and Wiki content, with emphasis on content organization and a robust tagging system

## Technology Stack

| Layer                     | Technology/Framework | Description                                                                                                 |
| ------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Backend API**           | tRPC                 | Type-safe end-to-end APIs with deep TypeScript integration                                                  |
| **Server-Side Rendering** | Next.js (App Router) | SSR for public pages, supporting dynamic routes and data prefetching                                        |
| **ORM**                   | Prisma               | Type-safe database client for PostgreSQL, supporting schema definition and migrations                       |
| **Frontend UI**           | shadcn/ui + magicui  | Customizable component library based on Radix UI and Tailwind CSS; magicui for advanced interactive effects |
| **Database**              | PostgreSQL           | Relational database supporting advanced features like JSON fields and full-text search                      |

## Core Feature Modules

### 1. Theme System

- Supports **color theme switching** (e.g., light/dark/custom)
- **Component-level styling customization** (e.g., card corner radius, font size), decoupled from color themes
- Persistent user theme preferences (via `localStorage` with SSR compatibility)

### 2. Authentication & Authorization

- **Basic authentication only**: login/logout and session management (using NextAuth.js or similar)
- **Permission model**:
  - **Public content**: Viewable by any logged-in user (most character, resource, and Wiki data)
  - **Sensitive content** (e.g., NSFW-tagged): Requires user to enable “Show NSFW Content” in settings
  - **No complex RBAC**: No role-based or fine-grained permission controls implemented

### 3. Character Database

- **CRUD operations**: Create, read, update, and delete character entries
- **Media uploads**: Avatar and portrait images
- **Tagging system**:
  - **Static tags**: Fixed fields (e.g., height, weight, birthday), supporting sorting, filtering, and statistical charts
  - **Dynamic tags**: Shared tags stored in dedicated `Tag` and `TagGroup` models (see Dynamic Tag System below)
- **Character relationships**: Define relationships between characters (e.g., "siblings", "rivals"), supporting unidirectional or bidirectional links
- **Search**: Full-text search + tag filtering + range queries on static fields

### 4. Resource Library

- **Supported types**: Images, videos, audio, and other media files
- **CRUD + upload functionality**
- **Many-to-many association with characters** (one resource can link to multiple characters; one character can have multiple resources)
- **Dynamic tag indexing**: Tags are stored in dedicated `Tag` model for fast retrieval and categorization (see Dynamic Tag System below)
- **Search**: Filter by tags, associated characters, file type, etc.

### 5. Wiki System

- **Content format**: Markdown with rich text support (images, links, tables, etc.)
- **AI-assisted features**: Optional AI-generated or AI-enhanced suggestions (frontend integration with DeepSeek; non-core business logic)
- **Many-to-many association with characters**
- **Version history**: Manual version snapshots; users can view historical content
- **Search**: Keyword search in content + associated characters + tags

## Data Model Constraints

### Personal Data (User-Related)

| Entity      | Fields/Relationships                               | Notes                                                   |
| ----------- | -------------------------------------------------- | ------------------------------------------------------- |
| **User**    | `id`, `email`, `name`, `avatar`, `settings` (JSON) | `settings` includes theme preference, NSFW toggle, etc. |
| **Comment** | `id`, `content`, `authorId`, `createdAt`           | Many-to-many with **Character** (via join table)        |

> ⚠️ Comments are only associated with characters; commenting on resources or Wiki pages is not supported at this time.

### Public Data

#### **Character**

- `id`, `name`, `avatarUrl`, `portraitUrl`
- `staticTags`: JSON or structured fields (e.g., `{ height: number, weight: number, birthday: Date }`)
- `tags`: Many-to-many relation to `Tag` via `CharacterTag` join table
- `relations`: Self-referencing many-to-many relationship with relationship type descriptor
- `info`: Summary text (Markdown-supported)

#### **Resource**

- `id`, `title`, `fileUrl`, `mimeType`, `uploaderId` (optional)
- `tags`: Many-to-many relation to `Tag` via `ResourceTag` join table
- Many-to-many association with `Character`

#### **WikiPage**

- `id`, `title`, `content` (Markdown)
- `authorId` (creator, optional)
- Many-to-many association with `Character`
- (Optional) `aiSuggestionEnabled: boolean`
