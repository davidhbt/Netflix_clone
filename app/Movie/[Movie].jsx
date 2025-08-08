import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, Linking, StatusBar, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ALERT_KEY = "hideFullscreenAlert";

const Movie = () => {
  const { uri } = useLocalSearchParams();
  const videoUrl = uri;

  const webViewRef = useRef(null);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const MAX_REDIRECT_ATTEMPTS = 3;

  const lockAttempts = useRef(0);
  const lock = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        // Lock once to landscape
        lockAttempts.current += 1;
        if (lockAttempts.current === 1) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
          console.log("Locked to landscape (first mount)");
        } else {
          await ScreenOrientation.unlockAsync();
          console.log("Unlocked (re-render detected)");
        }
      } catch (e) {
        console.warn("Orientation error:", e);
      }

      // Check AsyncStorage to decide whether to show the alert
      const hideAlert = await AsyncStorage.getItem(ALERT_KEY);
      if (!hideAlert) {
        Alert.alert(
          "Important",
          "Please don't click the full screen button in the video player, as it causes a crash.",
          [
            {
              text: "Got it",
              onPress: () => console.log("Alert closed"),
            },
            {
              text: "Don't show again",
              onPress: async () => {
                try {
                  await AsyncStorage.setItem(ALERT_KEY, "true");
                  console.log("Alert preference saved");
                } catch (e) {
                  console.warn("Failed to save alert preference:", e);
                }
              },
            },
          ],
          {
            cancelable: false,
          }
        );
      }
    })();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        .then(() => console.log("Orientation reset to PORTRAIT on unmount"))
        .catch(console.warn);
    };
  }, []);

  const injectedJS = `
    window.open = function() { return null; };
    history.pushState = function() {};
    history.replaceState = function() {};

    document.addEventListener('click', function(e) {
      const target = e.target.closest('a');
      if (target) {
        e.preventDefault();
        target.href = "javascript:void(0)";
        return false;
      }
    }, true);

    Object.defineProperty(window, 'location', {
      configurable: false,
      writable: false,
      value: window.location
    });

    true;
  `;

  const onShouldStartLoadWithRequest = (request) => {
    try {
      const urlObj = new URL(request.url);

      if (!["http:", "https:"].includes(urlObj.protocol)) {
        console.warn("Blocked non-http(s) URL:", request.url);
        forceRedirect();
        return false;
      }

      const allowedHosts = ["streamingnow.mov", "multiembed.mov", "vidsrc.cc"];
      const isAllowed = allowedHosts.some(
        (host) =>
          urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
      );

      if (!isAllowed) {
        console.warn("Blocked external navigation to:", request.url);
        forceRedirect();
        return false;
      }

      return true;
    } catch (err) {
      console.warn("Blocked malformed URL:", request.url);
      forceRedirect();
      return false;
    }
  };

  const forceRedirect = () => {
    if (redirectAttempts >= MAX_REDIRECT_ATTEMPTS) return;
    setRedirectAttempts((prev) => prev + 1);
    webViewRef.current?.stopLoading();
    webViewRef.current?.injectJavaScript(
      `window.location.href = "${videoUrl}";`
    );
  };

  return (
    <View className="bg-black" style={{ flex: 1 }}>
      <StatusBar hidden={true} />
      <WebView
        ref={webViewRef}
        source={{ uri: videoUrl }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScript={injectedJS}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        style={{ flex: 1 }}
        onFullscreenChange={(event) => {
          if (event.nativeEvent.isFullscreen) {
            ScreenOrientation.unlockAsync();
            lock.current = true;
          } else {
            ScreenOrientation.unlockAsync();
          }
        }}
      />
    </View>
  );
};

export default Movie;
