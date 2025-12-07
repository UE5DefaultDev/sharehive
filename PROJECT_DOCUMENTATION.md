# Sharehive Project Documentation

## 1. Project Overview

Sharehive is a full-stack web application designed as a platform for users to share and discover educational content through "courses". It allows users to create their own courses with text and images, follow courses created by others, and engage in discussions through comments. The application features user authentication, profile management, and a feed-based interface for browsing content.

### Core Features:

- **User Authentication**: Secure sign-up and sign-in functionality handled by Clerk.
- **Course Creation**: Authenticated users can create new courses, providing a title, content, and an optional image.
- **Course Feed**: A central homepage that displays a feed of all available courses.
- **Follow/Unfollow**: Users can follow courses they are interested in and unfollow them.
- **User Profiles**: Each user has a public profile page displaying their bio, created courses, and followed courses.
- **Commenting**: Users can leave comments on course pages to foster discussion.
- **My Courses Page**: A dedicated page for users to view the courses they are participating in and the ones they have created.
- **Image Uploads**: Functionality for uploading images for courses, handled by UploadThing.
- **Dark/Light Mode**: Theme toggling for user preference.

---

## 2. Technologies Used

Sharehive is built with a modern, type-safe, and scalable tech stack.

- **Framework**: [Next.js](https://nextjs.org/) (v15) with the App Router.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database type**: [PostgreSQL](https://www.postgresql.org/)
- **Database**: [Neon DB](https://neon.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **File Uploads**: [UploadThing](https://uploadthing.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Date Formatting**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 3. Project Structure

The project follows a structure conventional for Next.js applications using the App Router.

```
/
├─── actions/           # Server-side actions for data mutation (create, update, delete).
├─── app/               # Next.js App Router directory.
│   ├─── api/           # API routes (e.g., for UploadThing webhooks).
│   ├─── (routes)/      # Route groups and individual page.tsx/layout.tsx files.
│   └─── layout.tsx     # Root layout of the application.
│   └─── page.tsx       # Homepage component.
│   └─── globals.css    # Global stylesheets.
├─── components/        # Reusable React components.
│   └─── ui/            # Unstyled components from shadcn/ui.
├─── lib/               # Library code, utilities, and client initializations.
│   ├─── prisma.ts      # Prisma client instance.
│   ├─── uploadthing.ts # UploadThing client configuration.
│   └─── utils.ts       # Utility functions.
├─── prisma/            # Prisma configuration.
│   └─── schema.prisma  # Defines the database schema and models.
├─── public/             # Static assets (images, SVGs, etc.).
├─── .env               # Environment variables (needs to be created).
├─── next.config.ts     # Next.js configuration file.
└─── package.json       # Project dependencies and scripts.
```

---

## 4. How It Works

### System Architecture

Sharehive is built on a client-server architecture facilitated by Next.js. It leverages React Server Components (RSCs) for rendering static content and fetching data on the server, and Client Components for interactive UI elements.

### Data Flow & Communication

- **Data Fetching**: Data is primarily fetched on the server within Server Components using Prisma to query the PostgreSQL database.
- **Data Mutation**: All create, update, and delete operations are handled by **Next.js Server Actions**, located in the `/actions` directory. Client Components invoke these server actions as if they were regular asynchronous functions. This approach eliminates the need for traditional REST or GraphQL API endpoints for data mutations.
- **Data Format**: Data is transferred between the server and client as serialized JSON, which is handled automatically by the Next.js framework during Server Action calls.
- **UI Updates**: After a mutation, server actions use Next.js's `revalidatePath()` function to invalidate the cache and trigger a re-render of the affected parts of the UI, ensuring data consistency.

### Authentication Flow

1.  **Middleware**: The `middleware.ts` file uses Clerk's middleware to protect routes and manage authentication state.
2.  **Sign-in/Sign-up**: Clerk's pre-built components are used to handle the user interface for signing in and signing up.
3.  **User Sync**: Upon a user's first login, the `syncUser` server action is triggered. This action checks if the user exists in the application's PostgreSQL database. If not, it creates a new user record, linking it to the user's unique Clerk ID. This keeps the application's database in sync with Clerk's user data.

---

## 5. Database Schema

The database schema is defined in `prisma/schema.prisma` and consists of three main models: `User`, `Course`, and `Comment`.

- **`User`**: Stores user profile information, including their Clerk ID, username, and bio.
- **`Course`**: Represents a course created by a user. It includes a title, content, an optional image, and relations to the author and followers.
- **`Comment`**: Represents a comment made by a user on a specific course.

Relationships:

- A `User` can create many `Course`s (`coursesCreated`).
- A `User` can follow many `Course`s (`followedCourses`), and a `Course` can be followed by many `User`s (a many-to-many relationship).
- A `User` can make many `Comment`s.
- A `Course` can have many `Comment`s.

---

## 6. Scaling the System

The current architecture is well-suited for scaling:

- **Application Server**: Being a Next.js application, it can be deployed to serverless platforms like Vercel or AWS Amplify. These platforms automatically handle scaling of the application layer based on traffic.
- **Database**: The database is the most critical component to scale.
  - **Vertical Scaling**: Increase the resources (CPU, RAM) of the PostgreSQL instance.
  - **Connection Pooling**: Use a connection pooler like PgBouncer or Prisma's Accelerate to manage database connections efficiently, which is crucial in a serverless environment.
  - **Read Replicas**: For read-heavy workloads, introduce read replicas to distribute read queries across multiple database instances.
- **File Storage**: File uploads are handled by UploadThing, which typically uses a scalable object storage service like Amazon S3 under the hood. This offloads the burden of file storage and delivery from the application server.
- **Caching**: Next.js provides multiple layers of caching (Data Cache, Full Route Cache). Judicious use of caching and on-demand revalidation (`revalidatePath`) helps reduce database load and improve performance.

---

## 7. Getting Started

To run this project locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)
- [PostgreSQL](https://www.postgresql.org/download/) running locally or a connection string to a hosted instance.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sharehive
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following variables.

```env
# ------------------
# DATABASE
# ------------------
# Get this from your PostgreSQL provider.
# Example for local PostgreSQL: "postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
DATABASE_URL="your-postgresql-connection-string"

# ------------------
# AUTHENTICATION (CLERK)
# ------------------
# Get these from your Clerk.com dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ------------------
# FILE UPLOADS (UPLOADTHING)
# ------------------
# Get these from your UploadThing.com dashboard
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### 4. Set Up the Database

Run the Prisma migration command to create the tables in your database according to the schema.

```bash
npx prisma migrate dev
```

This will also generate the Prisma Client based on your schema.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
