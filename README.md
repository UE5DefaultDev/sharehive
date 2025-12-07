# Sharehive

## Project Overview

Sharehive is a full-stack web application designed as a platform for users to share and discover educational content through "courses". It allows users to create their own courses with text and images, follow courses created by others, and engage in discussions through comments. The application features user authentication, profile management, and a feed-based interface for browsing content.

---

See [Docs](/docs/overview.md) for more in-depth information.

---

### 💠 Core Features:

- **User Authentication**: Secure sign-up and sign-in functionality handled by Clerk.
- **Course Creation**: Authenticated users can create new courses, providing a title, content, and an optional image.
- **Course Feed**: A central homepage that displays a feed of all available courses.
- **Follow/Unfollow**: Users can follow courses they are interested in and unfollow them.
- **User Profiles**: Each user has a public profile page displaying their bio, created courses, and followed courses.
- **Commenting**: Users can leave comments on course pages.
- **My Courses Page**: A dedicated page for users to view the courses they are participating in and the ones they have created.
- **Image Uploads**: Functionality for uploading images for courses, handled by UploadThing.
- **Dark/Light Mode**: Theme toggling for user preference.

---

## 🧱 Tech Stack Overview

This project uses a modern and scalable stack designed for performance, developer experience, and clean architecture. Below is a short overview of each technology and its role in the system.

---

### ⚡ [Next.js](https://nextjs.org/)

Next.js serves as the main React framework, providing server-side rendering, API routes, file-based routing, and server components for efficient data fetching and highly optimized performance.

### 🟦 [TypeScript](https://www.typescriptlang.org/)

TypeScript enhances JavaScript with static typing, improving reliability and maintainability by catching errors early and enabling powerful editor tooling and autocomplete.

### 🛠 [Prisma](https://www.prisma.io/)

Prisma is used as the ORM to define the database schema, generate fully type-safe queries, and handle migrations while integrating seamlessly with PostgreSQL and TypeScript.

### 🐘 [PostgreSQL](https://www.postgresql.org/) [(Neon DB)](https://neon.com/)

PostgreSQL is the primary relational database, hosted through Neon DB for serverless scaling, branching, and high-performance cloud storage with excellent reliability.

### 🔐 [Clerk](https://clerk.com/)

Clerk powers authentication and user management, offering secure session handling, OAuth flows, and prebuilt UI components that integrate directly with Next.js.

### 🎨 [Tailwind CSS](https://tailwindcss.com/)

Tailwind CSS provides a utility-first approach to styling, enabling fast UI development with consistent design patterns and minimal custom CSS.

### 🧩 [shadcn/ui](https://ui.shadcn.com/)

shadcn/ui offers a collection of customizable, accessible components built with Radix and Tailwind, giving full control over the UI since components live directly inside the project.

### 📤 [UploadThing](https://uploadthing.com/)

UploadThing handles file uploads with a simple API tailored for Next.js, providing secure server-side validation and returning accessible, optimized file URLs.

### 🔔 [React Hot Toast](https://react-hot-toast.com/)

React Hot Toast manages user notifications with lightweight, visually appealing toasts that are easy to trigger from anywhere in the application.

### 🗓 [date-fns](https://date-fns.org/)

date-fns supplies modular, functional utilities for formatting and manipulating dates, offering speed, simplicity, and tree-shaking-friendly imports.

### 💡 [Lucide React](https://lucide.dev/)

Lucide React provides a large, modern icon set as React components, making icons easy to customize with props or Tailwind classes.

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Text restructuring and reform by [ChatGPT](https://chatgpt.com)
