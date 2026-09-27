# 🚀 AgriLink Online Hosting & Mobile Application Guide

This guide explains how to:
1. Host AgriLink online **24/7 for free**.
2. Run AgriLink as an **installable Mobile Application** (PWA on Android/iOS).
3. Test immediately on a mobile device right now.
4. (Optional) Wrap into a standalone **Android APK** using Capacitor.

---

## 📱 1. Running AgriLink as a Mobile Application (PWA)

AgriLink is now an installable **Progressive Web Application (PWA)** with full-screen standalone mode, app launcher icons, and offline caching.

### On Android (Chrome / Brave / Edge):
1. Open your live AgriLink URL (or local network URL) on your Android phone's browser.
2. Tap the **"📲 Install App"** button in the top navigation bar (or tap the **⋮ (three dots)** menu in Chrome -> **"Install app"** or **"Add to Home screen"**).
3. The AgriLink app icon will appear directly on your phone's home screen.
4. Opening it launches AgriLink in **full-screen standalone app mode** (no browser address bars, just like an app downloaded from Google Play Store).

### On iPhone / iPad (Safari):
1. Open your live AgriLink URL in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up ⎋ at the bottom of the screen).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. The AgriLink icon is now installed on your iOS home screen and opens as a standalone native-feeling app.

---

## ⏰ 2. Keeping the Online Hosting Running 24/7 (Never Sleep)

Free-tier cloud providers like Render put inactive web services to sleep after 15 minutes. AgriLink has built-in 24/7 resilience:

### A. Automatic Internal Keep-Alive:
In your Render dashboard environment variables, add:
| Key | Value | Description |
|-----|-------|-------------|
| `RENDER_EXTERNAL_URL` | `https://your-agrilink.onrender.com` | Automatically detects Render public URL and pings `/api/health` every 14 minutes |
| `KEEP_ALIVE` | `true` | Enables the anti-sleep ping loop |

### B. Free External Keep-Alive (Guaranteed 100% 24/7 Uptime):
Use a free ping service so your site never goes down:
1. Go to **[cron-job.org](https://cron-job.org)** or **[uptimerobot.com](https://uptimerobot.com)** (both 100% free forever).
2. Create a new monitor / cron job:
   - **URL**: `https://your-agrilink.onrender.com/api/health`
   - **Interval**: Every 5 or 10 minutes
   - **Method**: `GET`
3. This guarantees your backend will **never go to sleep** and will respond instantly 24 hours a day, 7 days a week!

---

## 🌐 3. All-In-One Free Hosting on Render (Recommended)

Render hosts both the **React Frontend** and **Node.js Express Backend** together on a single live URL (e.g. `https://agrilink.onrender.com`).

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add PWA mobile app support and 24/7 keep-alive"
   git push origin main
   ```

2. **Sign Up / Log In to Render**:
   - Go to [https://render.com](https://render.com) and log in with your GitHub account.

3. **Create a New Web Service**:
   - In Render Dashboard, click **New +** -> **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect your `agrilink` repository.

4. **Configure Service Settings**:
   - **Name**: `agrilink` (or your chosen app name)
   - **Region**: Nearest region (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Set Environment Variables**:
   Under **Environment Variables** in Render, add the variables from your `server/.env` file:
   | Key | Recommended Value / Source | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Render standard port |
   | `KEEP_ALIVE` | `true` | Prevents Render free tier from sleeping |
   | `JWT_SECRET` | *(from your server/.env)* | Secret key for JWT sessions |
   | `RESET_OTP_PEPPER` | *(from your server/.env)* | Secret key for OTP hashing |
   | `CLIENT_ORIGIN` | `*` | Permits requests from any origin / mobile app |
   | `MONGODB_URI` | *(from your server/.env)* | Your MongoDB Atlas connection string |
   | `GOOGLE_SCRIPT_URL` | *(from your server/.env)* | Free email webhook (Port 443 HTTPS) |
   | `EMAIL_HOST` | `smtp.gmail.com` | SMTP host |
   | `EMAIL_PORT` | `465` | SSL port |
   | `EMAIL_SECURE` | `true` | SSL enabled |
   | `EMAIL_USER` | *(from your server/.env)* | Sender Gmail address |
   | `EMAIL_PASSWORD` | *(from your server/.env)* | Gmail App Password |
   | `RESEND_API_KEY` | *(from your server/.env)* | Backup email API |
   | `SMS_PROVIDER` | `twilio` | SMS provider |
   | `TWILIO_ACCOUNT_SID` | *(from your server/.env)* | Twilio Account SID |
   | `TWILIO_AUTH_TOKEN` | *(from your server/.env)* | Twilio Auth Token |
   | `TWILIO_FROM_NUMBER` | *(from your server/.env)* | Twilio Phone Number |

6. **Click "Deploy Web Service"**:
   - Once deployment finishes, your website and mobile PWA will be live at:
     **`https://<your-service-name>.onrender.com`**

---

## 📲 4. Test on Your Mobile Phone Right Now (Local or Public Tunnel)

### Method A: Local WiFi Network (Instant)
If your phone and computer are on the same WiFi network:
1. Find your computer's local IP address (`ipconfig` on Windows -> look for IPv4 Address, e.g. `192.168.1.15`).
2. Run Vite with host flag:
   ```bash
   npm --prefix client run dev -- --host 0.0.0.0
   ```
3. On your phone's browser, open `http://<your-pc-ip>:5173`.
4. The website will load on your phone, and you can test all features!

### Method B: Instant Public Tunnel (Localtunnel)
Expose your local server to a public HTTPS URL accessible from any phone anywhere:
1. Start your application:
   ```bash
   npm start
   ```
2. In a separate terminal, run:
   ```bash
   npx localtunnel --port 5000
   ```
3. Localtunnel will output a public HTTPS URL (e.g. `https://hungry-frog-42.loca.lt`).
4. Open that URL on your mobile phone to test live over 4G/5G/WiFi!

---

## 🤖 5. Building a Standalone Android APK (Optional via Capacitor)

If you need a `.apk` file to distribute or publish to Google Play Store:

1. **Install Capacitor inside `client/`**:
   ```bash
   cd client
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init AgriLink io.agrilink.app --web-dir dist
   ```

3. **Build the production web assets**:
   ```bash
   npm run build
   ```

4. **Add the Android platform**:
   ```bash
   npx cap add android
   npx cap copy android
   ```

5. **Open and build the APK in Android Studio**:
   ```bash
   npx cap open android
   ```
   In Android Studio, click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**. Your `.apk` will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`!
