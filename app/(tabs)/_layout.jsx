import { Tabs } from "expo-router";
import CustomTab from "../../Components/ui/CustomTab";
import { StatusBar } from "react-native";
import React from "react";

const TabsLayout = () => {
  console.log("tabs Layout");
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <Tabs
        screenOptions={{ headerShown: false, lazy: true }}
        tabBar={(props) => <CustomTab {...props} />}
        initialRouteName="index"
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="Movies" options={{ title: "Movies" }} />
        <Tabs.Screen name="TvShows" options={{ title: "Tv Shows" }} />
        <Tabs.Screen name="Search" options={{ title: "Search" }} />
      </Tabs>
    </>
  );
};

export default React.memo(TabsLayout);
