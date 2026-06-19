# SiteClock — Phase 2 setup (real data + real privacy)

Phase 1 (the demo) keeps everything in the browser, so data resets on refresh and
the logins aren't real. **Phase 2 adds a server (Supabase)** so that:

- Shifts, sites, and people are **saved permanently**.
- Logins are **real accounts** (email + password).
- Privacy is **enforced by the server**: a worker's device literally cannot receive
  payroll or other workers' locations, even if someone tampered with the app.

You do a one-time setup (about 15 minutes, no coding). Then I wire the app to it.

---

## Step 1 — Create a Supabase project (free)
1. Go to https://supabase.com and sign up (GitHub or email).
2. Click **New project**. Give it a name (e.g. `siteclock`), set a database password
   (save it somewhere), pick the region closest to Toronto (**East US** is fine), Create.
3. Wait ~2 minutes for it to finish setting up.

## Step 2 — Create the database
1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file **siteclock-phase2-schema.sql**, copy everything, paste it in, click **Run**.
3. You should see "Success". This creates the tables, the security rules, and 3 starter sites.

## Step 3 — Create your foreman login
1. Left sidebar → **Authentication** → **Users** → **Add user** → enter your email + a password → Create.
2. Make that account a foreman: open **SQL Editor** again and run (with your email):
   ```sql
   update public.profiles set role = 'foreman'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

## Step 4 — Get your two connection values
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy these two values and send them to me:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

   These two are safe to put in a front-end app — the security rules from Step 2 are what
   protect the data, not secrecy of these values. (Do NOT send the `service_role` key.)

---

## What I do next (once you send those two values)
I wire the app to Supabase so that:
- **Foreman** signs in with email/password → sees the live board, all shifts, labor cost,
  and can add/remove **sites** and **people** (saved to the database).
- **Worker** signs in → sees only their own hours, pay, and location; clock in/out and the
  left-site checks write to the database.
- Everything **persists** and is **private by server rule**, exactly as above.

## Notes / decisions for Phase 2
- **Worker login:** Phase 2 uses email + password (real, secure). If you prefer the simple
  4-digit **PIN** login for workers (easier in the field), that's a small add-on later using
  a Supabase "Edge Function" — tell me and I'll include it.
- **Creating worker accounts:** at first you can add workers from the Supabase
  **Authentication → Users → Add user** screen (a profile row is created automatically),
  then set their site/rate in the app. Later I can add an in-app "Add worker" that creates
  the account for you (also a small Edge Function).
- **Background GPS** (catching someone who closes the app) still needs the mobile-app wrapper
  (Capacitor) — that's Phase 3, after data + accounts are solid.

When you've done Steps 1–4, paste me the **Project URL** and **anon key** and I'll build the
connected version.
