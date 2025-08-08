import { useEffect, useRef, useState } from "react";
import { StatusBar, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

const Movie = () => {
  const { uri } = useLocalSearchParams();
  const videoUrl = uri;

  const webViewRef = useRef(null);
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  const MAX_REDIRECT_ATTEMPTS = 3;

  useEffect(() => {
    const tryLockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );

        // Confirm if orientation actually changed
        const orientation = await ScreenOrientation.getOrientationAsync();

        const isLandscape =
          orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

        if (!isLandscape) {
          console.warn("Orientation lock may be blocked by system settings.");
          // Optionally show a fallback UI or rotate the component manually
          // setFallbackRotation(true);
        }
      } catch (err) {
        console.warn("Failed to lock orientation:", err);
      }
    };

    tryLockOrientation();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(console.warn);
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
    if (!blockingEnabled) return true;

    try {
      const urlObj = new URL(request.url);

      // Only allow http or https
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        console.warn("Blocked non-http(s) URL:", request.url);
        forceRedirect();
        return false;
      }

      // Only allow exact hostname
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
      <StatusBar
        hidden={true}
        // style="light"
        // translucent={true}
        // backgroundColor={"transparent"}
      />
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
      />
    </View>
  );
};

export default Movie;
