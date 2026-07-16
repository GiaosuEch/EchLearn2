# Supabase Setup Guide for Ech Lern

This guide provides step-by-step instructions on how to connect your Ech Lern platform to a live Supabase backend. When Supabase is configured, the application automatically switches from Local Mode to Supabase Live Mode.

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Click **New Project** and select your organization.
3. Enter a name for your project (e.g., `ech-lern`), generate a strong database password, and select a region closest to your users.
4. Click **Create new project**. It may take a few minutes for the database to provision.

## 2. Execute the Database Schema
1. Once your project is ready, navigate to the **SQL Editor** from the left sidebar.
2. Click **New query**.
3. Open the `supabase/schema.sql` file in this repository, copy its entire contents, and paste it into the SQL Editor.
4. Click the **Run** button (or press `Cmd/Ctrl + Enter`) to execute the query.
5. Verify that the tables (`profiles`, `learning_progress`, `xp_events`, etc.) have been created successfully in the **Table Editor**.

## 3. Retrieve Environment Variables
1. In the Supabase dashboard, go to **Project Settings** (the gear icon at the bottom left).
2. Select **API** under Configuration.
3. Find your **Project URL**. This is your `VITE_SUPABASE_URL`.
4. Find your **Project API keys** and copy the `anon` `public` key. This is your `VITE_SUPABASE_ANON_KEY`.

## 4. Configure Your Local Environment
1. In the root directory of your project, rename `.env.example` to `.env`.
2. Open `.env` and paste your URL and Anon Key:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Enable Email Authentication
1. Go to **Authentication** in the Supabase dashboard.
2. Under **Providers**, ensure that **Email** is enabled.
3. (Optional) For testing purposes, you may want to disable "Confirm email" under **Auth Providers > Email** so you don't have to verify the email address during local development.

## 6. Run the Application
1. Start the development server: `npm run dev`
2. Open the application in your browser.
3. You should see a "Supabase Live Mode" badge in the UI (e.g., in the header or sidebar).
4. Register a new account through the application.

## 7. Verify Data
1. Go back to the Supabase dashboard and open the **Authentication > Users** tab. You should see the user you just registered.
2. Open the **Table Editor**, select the `profiles` table, and verify that a new row was automatically created for your user via the database trigger.

Your Ech Lern platform is now fully connected to a live production database!
