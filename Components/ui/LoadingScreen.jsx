import { View, Text, ActivityIndicator } from "react-native";
import React from "react";

const LoadingScreen = () => {
  return (
    <View className="w-full h-full justify-center items-center bg-slate-900">
      <ActivityIndicator size={"large"} color="white" />
    </View>
  );
};

export default LoadingScreen;
