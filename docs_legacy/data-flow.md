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
    participant ClientBrowser [Browser]
    participant Clerk
    participant BackendWebhook [Next.js API Route]
    participant DB [Neon DB]

    User->>ClientBrowser: Clicks "Sign Up" button
    ClientBrowser->>Clerk: Initiates sign-up flow (displays Clerk's form)
    User->>Clerk: Submits registration form (e.g., email & password)
    Clerk->>Clerk: Creates user record in its own system

    par
        Clerk-->>ClientBrowser: Returns session JWT (in cookie)
        ClientBrowser-->>User: Logs user in and redirects
    and
        Clerk-->>BackendWebhook: Sends `user.created` webhook (POST Request, JSON body)
        BackendWebhook->>BackendWebhook: Verifies webhook signature
        BackendWebhook->>DB: `prisma.user.create()` using Clerk user ID and email
        DB-->>BackendWebhook: Confirms user creation
        BackendWebhook-->>Clerk: Returns `200 OK`
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
    participant ClientCreateCourse [CreateCourse.tsx]
    participant ServerCourseAction [course.action.ts]
    participant AuthClerkServer [Clerk (Server-side)]
    participant DB [Neon DB (Prisma)]

    User->>ClientCreateCourse: Fills and submits the "New Course" form
    ClientCreateCourse->>ServerCourseAction: Invokes `createCourse(formData)`
    note right of ServerCourseAction: This is a direct, type-safe RPC call,<br/>not a traditional HTTP request.

    ServerCourseAction->>AuthClerkServer: `currentUser()`
    AuthClerkServer-->>ServerCourseAction: Returns authenticated user object
    alt User is Authenticated
        ServerCourseAction->>ServerCourseAction: Validates form data
        ServerCourseAction->>DB: `prisma.course.create({ data: { title: ..., authorId: ... } })`
        DB-->>ServerCourseAction: Returns the newly created course object
        ServerCourseAction->>ServerCourseAction: `revalidatePath('/courses')` to invalidate cache
        ServerCourseAction-->>ClientCreateCourse: Returns success object
        ClientCreateCourse->>User: Displays "Success" notification
    else User is Not Authenticated
        ServerCourseAction-->>ClientCreateCourse: Throws/returns authentication error
        ClientCreateCourse->>User: Displays "Error" notification
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
    participant ClientImageUpload [ImageUpload.tsx]
    participant BackendUploadThing [api/uploadthing/core.ts]
    participant AuthClerk [Clerk]
    participant UploadThing
    participant S3CloudStorage [Cloud Storage]
    participant DB [Neon DB (Prisma)]

    User->>ClientImageUpload: Clicks upload button and selects a file

    %% Step 1: Client requests permission
    ClientImageUpload->>BackendUploadThing: POST request to get upload permission for 'imageUploader'

    %% Step 2: Backend authorizes the user
    BackendUploadThing->>AuthClerk: `currentUser()`
    AuthClerk-->>BackendUploadThing: Returns user object
    alt User is Authenticated
        %% Step 3: Backend gets a presigned URL from UploadThing
        BackendUploadThing->>UploadThing: Request presigned URL for the file
        UploadThing-->>ClientImageUpload: Return presigned URL (JSON)
    else User is Not Authenticated
        BackendUploadThing-->>ClientImageUpload: Return 403 Forbidden error
    end

    %% Step 4: Client uploads the file directly to S3
    ClientImageUpload->>S3CloudStorage: PUT request with file binary to the presigned URL
    note over ClientImageUpload, S3CloudStorage: Our server is not involved in this transfer.

    %% Step 5: S3 confirms, and UploadThing triggers the completion callback
    S3CloudStorage-->>UploadThing: Confirms successful upload
    UploadThing->>BackendUploadThing: POST request (webhook) to `onUploadComplete` handler

    %% Step 6: Backend saves the file URL to the database
    BackendUploadThing->>DB: `prisma.course.update({ data: { image: file.url } })`
    DB-->>BackendUploadThing: Confirms database update
    BackendUploadThing-->>UploadThing: Returns `200 OK`

    %% Step 7: Client is notified of completion
    ClientImageUpload->>User: Display "Upload Complete" notification
```

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
