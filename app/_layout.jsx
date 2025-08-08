import { Stack } from "expo-router";
import { createContext, useMemo } from "react";
import { StatusBar } from "react-native";
import React from "react";

export const APIKEY = createContext({});

const RootLayout = () => {
  const contextValue = useMemo(
    () => ({
      Key: process.env.EXPO_PUBLIC_TMDB_API,
    }),
    []
  );

  console.log("root Layout");

  return (
    <APIKEY.Provider value={contextValue}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </APIKEY.Provider>
  );
};

export default React.memo(RootLayout);
