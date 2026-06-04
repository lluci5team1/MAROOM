// app.config.ts
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "maroom-app",
  slug: "maroom-app",
  version: "1.0.0",

  orientation: "portrait",

  icon: "./src/shared/assets/icon.png",

  scheme: "maroomapp",

  userInterfaceStyle: "automatic",

  newArchEnabled: true,

  platforms: ["ios", "android", "web"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.maroom.app",
    buildNumber: "25",
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            "com.googleusercontent.apps.917533190545-kuuchres7gqrqf463lkm5jr1lek2me2u",
          ],
        },
      ],
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./src/shared/assets/adaptive-icon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  web: {
    output: "static",
    favicon: "./src/shared/assets/favicon.png",
  },

  plugins: [
    "expo-router",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./src/shared/assets/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "cd2161f5-ca50-4bbf-8db7-23e8433914ca",
    },
    router: {
      root: "src/app",
    },
  },
};

export default config;
