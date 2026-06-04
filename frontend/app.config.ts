// app.config.ts
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "maroom-app",
  slug: "maroom-app",
  owner: "peihengjun",
  version: "1.0.0",

  orientation: "portrait",

  icon: "./src/shared/assets/icon.png",

  scheme: "maroomapp",

  userInterfaceStyle: "automatic",

  // Required by react-native-reanimated 4.x (pod install fails if false).
  newArchEnabled: true,

  platforms: ["ios", "android", "web"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.maroom.app",
    buildNumber: "9",
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
      "expo-image-picker",
      {
        "photosPermission": "Allow MAROOM to access your photos to set a profile picture.",
        "cameraPermission": "Allow MAROOM to use your camera to take a profile picture."
      }
    ],
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

  updates: {
    url: "https://u.expo.dev/ee399f93-31d0-4b68-bf47-9e448a53f1c4",
  },

  runtimeVersion: {
    policy: "appVersion",
  },

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "ee399f93-31d0-4b68-bf47-9e448a53f1c4",
    },
    router: {
      root: "src/app",
    },
  },
};

export default config;
