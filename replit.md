# DDLA MyCabinet - Dənizçi Şəxsi Kabineti

## Overview

DDLA (Dövlət Dəniz və Liman Agentliyi) Seafarer Personal Cabinet mobile application.
Backend: CodeIgniter 4 at `https://seafarer.ddla.gov.az`

## Structure

```text
├── artifacts/
│   └── mobile/              # Expo React Native mobile app (development preview)
├── flutter_app/             # Flutter/Dart version (production build)
├── pnpm-workspace.yaml      # pnpm workspace config
└── package.json             # Root package
```

## Expo Mobile App (`artifacts/mobile`)

Expo React Native app for development preview in Replit.

- **Backend API**: `https://seafarer.ddla.gov.az` — mobile routes under `/mobile/`
- **Auth headers**: `X-Mobile: 1`, `X-Pin: {pin}`, `X-Session: {session}`
- **FIN login**: `POST /mobile/check-fin`
- **Photo URL**: `https://seafarer.ddla.gov.az/image/{unikal}`
- **Theme**: Dark/Light with color tokens (DARK BG `#060d1a`, teal `#00d4c8`, blue `#0057B7`)
- **Features**: animated splash, ocean waves, myGov + FIN login, certificates, trainings, services, profile, notifications, documents, feedback, settings (PIN + biometric)
- **Run**: `pnpm --filter @workspace/mobile run dev`

## Flutter App (`flutter_app/`)

Full Flutter/Dart rewrite — same functionality as Expo version.

- **State management**: Provider (`ChangeNotifier`) — AuthProvider, ThemeProvider
- **Storage**: `shared_preferences`, `flutter_secure_storage`
- **Dependencies**: http, provider, shared_preferences, flutter_secure_storage, local_auth, url_launcher, google_fonts

### Structure
```
flutter_app/
├── pubspec.yaml
├── analysis_options.yaml
├── assets/images/
└── lib/
    ├── main.dart
    ├── theme/colors.dart
    ├── services/api.dart
    ├── providers/ (auth_provider.dart, theme_provider.dart)
    ├── widgets/ (ocean_waves.dart)
    └── screens/ (splash, login, home, certificates, trainings, services, profile, notifications, documents, feedback, settings)
```

### Run
```bash
cd flutter_app
flutter pub get
flutter run
```

## GitHub
Repository: `Kanannovruzov/MyCabinet`
