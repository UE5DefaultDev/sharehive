# 3. End-to-End Data Flows

This document provides a detailed, step-by-step visualization of how data moves through the ShareHive system for critical user actions. Each diagram illustrates the sequence of interactions between different parts of our architecture.

**[◄ Back to Overview](./overview.md)**

### Table of Contents
1. [Data Flow: New User Registration](#1-data-flow-new-user-registration)
2. [Data Flow: User Creates a New Course](#2-data-flow-user-creates-a-new-course)
3. [Data Flow: User Uploads a Course Image](#3-data-flow-user-uploads-a-course-image)
4. [Data Flow: Reading Course Data (Server Component)](#4-data-flow-reading-course-data-server-component)

---

### 1. Data Flow: New User Registration

This flow details how a new user is created and how their data is synchronized between Clerk and our application's database.

```mermaid
sequenceDiagram
    participant User
    participant Client [Browser (Clerk UI)]
    participant Clerk
    participant Backend [Next.js API Route<br>/api/webhook/clerk]
    participant DB [Neon DB (PostgreSQL)]

    User->>Client: Clicks "Sign Up" button
    Client->>Clerk: Initiates sign-up flow (displays Clerk's form)
    User->>Clerk: Submits registration form (e.g., email & password)
    Clerk->>Clerk: Creates user record in its own system
    
    par
        Clerk-->>Client: Returns session JWT (in cookie)
        Client-->>User: Logs user in and redirects
    and
        Clerk-->>Backend: Sends `user.created` webhook (POST Request, JSON body)
        Backend->>Backend: Verifies webhook signature
        Backend->>DB: `prisma.user.create()` using Clerk user ID and email
        DB-->>Backend: Confirms user creation
        Backend-->>Clerk: Returns `200 OK`
    end
```
- **Initiator**: User action.
- **Data Format**: The webhook from Clerk to our backend is a `JSON` payload.
- **Storage**: Clerk stores the primary user identity. Our **Neon DB** stores a corresponding application-level user record, linked by the `clerkId`.

---

### 2. Data Flow: User Creates a New Course

This flow illustrates the use of a Next.js Server Action to handle form submission and create a new database record.

```mermaid
sequenceDiagram
    participant User
    participant Client [CreateCourse.tsx]
    participant Server [course.action.ts]
    participant Auth [Clerk (Server-side)]
    participant DB [Neon DB (Prisma)]

    User->>Client: Fills and submits the "New Course" form
    Client->>Server: Invokes `createCourse(formData)`
    note right of Server: This is a direct, type-safe RPC call,<br>not a traditional HTTP request.

    Server->>Auth: `currentUser()`
    Auth-->>Server: Returns authenticated user object
    alt User is Authenticated
        Server->>Server: Validates form data
        Server->>DB: `prisma.course.create({ data: { title: ..., authorId: ... } })`
        DB-->>Server: Returns the newly created course object
        Server->>Server: `revalidatePath('/courses')` to invalidate cache
        Server-->>Client: Returns success object
        Client->>User: Displays "Success" notification
    else User is Not Authenticated
        Server-->>Client: Throws/returns authentication error
        Client->>User: Displays "Error" notification
    end
```
- **Initiator**: User form submission.
- **Data Format**: `FormData` is passed from the client to the Server Action.
- **Storage**: The new course data is stored as a new row in the `Course` table in our **Neon DB**.

---

### 3. Data Flow: User Uploads a Course Image

This flow details the secure file upload process managed by UploadThing, which avoids having the file pass through our application server.

```mermaid
sequenceDiagram
    participant User
    participant Client [ImageUpload.tsx]
    participant Backend [api/uploadthing/core.ts]
    participant Auth [Clerk]
    participant UploadThing
    participant S3 [Cloud Storage]
    participant DB [Neon DB (Prisma)]

    User->>Client: Selects an image file
    Client->>Backend: Requests permission to upload for 'imageUploader' route
    Backend->>Auth: `currentUser()` to verify session
    Auth-->>Backend: Returns user
    Backend-->>UploadThing: If authorized, requests a presigned URL
    UploadThing-->>Client: Returns presigned URL (JSON)
    
    note over Client, S3: File is uploaded directly from browser to cloud storage.
    Client->>S3: Uploads file binary via `PUT` request to presigned URL
    S3-->>UploadThing: Confirms successful upload
    
    UploadThing-->>Backend: Sends `onUploadComplete` webhook (JSON)
    Backend->>DB: `prisma.course.update({ where: ..., data: { image: file.url } })`
    DB-->>Backend: Confirms update
    Backend-->>UploadThing: Returns `200 OK`
```
- **Initiator**: User file selection.
- **Data Format**: The file is sent as `binary` data. All other communication is `JSON`.
- **Storage**: The file is stored in **UploadThing's S3 bucket**. The resulting file URL (a string) is stored in the `image` field of the `Course` table in our **Neon DB**.

---

### 4. Data Flow: Reading Course Data (Server Component)

This diagram shows the highly efficient data fetching pattern used for rendering read-only data with Next.js Server Components.

```mermaid
graph TD
    subgraph "User"
        A[Requests page `/course/abc`]
    end

    subgraph "Vercel Server"
        B["Executes Server Component for the page"]
        C["`prisma.course.findUnique({ where: { id: 'abc' } })`"]
    end
    
    subgraph "Data Layer"
        D[Neon DB]
    end

    A -- "1. HTTP GET Request" --> B
    B -- "2. Directly calls Prisma function" --> C
    C -- "3. Sends SQL query" --> D
    D -- "4. Returns course data" --> C
    C -- "5. Data is available to component" --> B
    B -- "6. Renders HTML with data" --> A
```
- **Initiator**: User navigation.
- **Data Flow**: This is the most direct flow. The request hits the server, the component runs, fetches data directly from the database, renders HTML, and returns it. There is no client-side JavaScript involved in the data fetching itself.
- **Storage**: Data is read from the **Neon DB**.

---
**[◄ Back to Overview](./overview.md)**