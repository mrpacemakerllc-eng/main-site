# Learning Platform

A complete video hosting and exam platform - your own alternative to Teachable!

## Features

- **User Authentication** - Login/Register system
- **Admin Dashboard** - Upload videos, create courses, build exams
- **Student Dashboard** - Browse and enroll in courses
- **Video Player** - Watch course videos
- **Exam System** - Create multiple-choice exams with auto-grading
- **Progress Tracking** - Track student progress and exam results

## Quick Start

The server is already running at: **http://localhost:3000**

### Default Login Credentials

You can create accounts, or use the register page to make a new admin account.

## How to Use

### As Admin:
1. Register a new account at http://localhost:3000/register
2. The first user you create will need to be manually set as admin in the database, OR you can modify the register API to set role='admin'
3. Create courses, upload videos, and create exams
4. Videos are stored locally in `public/uploads/videos/`

### As Student:
1. Register a new student account
2. Browse available courses
3. Enroll in courses
4. Watch videos and take exams

## Database

- Using SQLite (file: `prisma/dev.db`)
- To reset database: Delete `dev.db` and run `npx prisma migrate dev`

## File Structure

```
├── app/
│   ├── admin/              # Admin dashboard
│   ├── dashboard/          # Student dashboard
│   ├── course/[id]/        # Course viewer
│   ├── exam/[id]/          # Exam taking
│   ├── login/              # Login page
│   ├── register/           # Registration
│   └── api/                # API routes
├── prisma/
│   └── schema.prisma       # Database schema
└── public/
    └── uploads/            # Video storage
```

## Tech Stack

- **Next.js 15** - React framework
- **Prisma** - Database ORM
- **SQLite** - Database
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling

## Deployment

To deploy to production:

1. Change SQLite to PostgreSQL in `prisma/schema.prisma`
2. Set up environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. Use cloud storage (S3, Cloudflare R2) for videos instead of local files
4. Deploy to Vercel, Railway, or any Node.js host

## Video Storage

Currently videos are stored locally in `public/uploads/videos/`. For production:
- Use AWS S3
- Use Cloudflare R2
- Use any cloud storage service

## Making Your First Admin User

Option 1: Edit the database directly
Option 2: Modify `app/api/register/route.ts` line 31 to set `role: "admin"`

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Run production server
```

## Your Platform is Ready!

Visit http://localhost:3000 to get started!
