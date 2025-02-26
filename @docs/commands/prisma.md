# Prisma Commands Guide

All commands below should be run from the `server` directory unless specified otherwise.

## Database Migrations

### Create and Apply a New Migration
```bash
npx prisma migrate dev --name <migration-name>
```
- Creates a new migration file
- Applies pending migrations
- Regenerates Prisma Client
- Example: `npx prisma migrate dev --name add_user_model`

### Apply Migrations Without Schema Changes
```bash
npx prisma migrate deploy
```
- Applies pending migrations without modifying the schema
- Useful in production environments

### Reset Database
```bash
npx prisma migrate reset
```
- Drops all tables
- Reapplies all migrations
- Seeds the database (if a seed script exists)

## Schema Management

### Format Schema File
```bash
npx prisma format
```
- Formats the schema.prisma file

### Validate Schema
```bash
npx prisma validate
```
- Checks if schema.prisma is valid

## Database Visualization

### Open Prisma Studio
```bash
npx prisma studio
```
- Opens web interface to view/edit data
- Runs on http://localhost:5555 by default

## Client Generation

### Generate Prisma Client
```bash
npx prisma generate
```
- Regenerates Prisma Client after schema changes
- Run this after pulling changes that modify the schema

## Database Introspection

### Introspect Database
```bash
npx prisma db pull
```
- Updates schema.prisma to match the database
- Useful when database schema was modified externally

## Project-Specific Models

For our project with User, Post, Project, and Article models, here are some useful commands:

### View All Users
```bash
npx prisma studio
```
Then navigate to the User table

### Reset Database and Models
```bash
npx prisma migrate reset
```
This will reset all our models:
- Users
- Posts
- Projects
- Articles

### Create New Model Migration
```bash
npx prisma migrate dev --name add_new_feature
```
Use when adding new features to existing models, like:
- Adding fields to User
- Creating new relationships
- Modifying Post/Project/Article schemas 