# How to Run Credit Halo

## 1. Stop any existing Expo processes

Close any terminal windows running `expo start`. Or in PowerShell:

```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

## 2. Start the app

```bash
cd creditHalo
npm start
```

Or: `npx expo start`

A QR code will appear in the terminal.

## 3. Open on your phone

1. Install **Expo Go** from the App Store or Play Store.
2. Open **Expo Go** (not the regular Camera app).
3. Tap **“Scan QR code”** and scan the QR code from the terminal.
4. Wait for the app to load (first load can take 1–2 minutes).

## 4. “This is taking much longer than it should”

This usually means your phone can’t reach your computer. Try:

**A. Same Wi‑Fi** – Phone and computer must be on the same Wi‑Fi network.

**B. Windows Firewall** – When Windows asks to allow Node.js, click **Allow access**.

**C. Manual URL** – In Expo Go, tap “Enter URL manually” and type the `exp://` URL shown in the terminal (e.g. `exp://192.168.1.5:8081`).

**D. Tunnel mode** (if LAN fails):
```bash
npm run start:tunnel
```
Note: Tunnel may fail with ngrok errors; use LAN when possible.

## 5. Troubleshooting

- **“No data to extract”** – Use Expo Go to scan, not the Camera app.
- **Port in use** – Run: `npx expo start --port 19000`
