import { View, Platform, TouchableOpacity, Text } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { PlatformPressable } from "@react-navigation/elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedBtn = Animated.createAnimatedComponent(TouchableOpacity);

const CustomTab = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-evenly",
        position: "absolute",
        bottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
        width: "85%",
        backgroundColor: "#334155",
        alignSelf: "center",
        borderRadius: 9999,
        padding: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const getIcon = (routeName) => {
          switch (routeName) {
            case "index":
              return (
                <Ionicons
                  name="home"
                  size={24}
                  color={isFocused ? "white" : "white"}
                />
              );
            case "Movies":
              return (
                <Ionicons
                  name="film"
                  size={24}
                  color={isFocused ? "white" : "white"}
                />
              );
            case "TvShows":
              return (
                <Ionicons
                  name="tv"
                  size={24}
                  color={isFocused ? "white" : "white"}
                />
              );
            case "Search":
              return (
                <Ionicons
                  name="search"
                  size={24}
                  color={isFocused ? "white" : "white"}
                />
              );
          }
        };

        return (
          <AnimatedBtn
            layout={LinearTransition}
            className={`flex-row items-center h-[40px]  px-[15px]  rounded-full overflow-hidden ${
              isFocused && "bg-rose-600"
            }`}
            key={route.key}
            href={buildHref(route.name, route.params)}
            onPress={onPress}
            // style={{ flex: 1 }}
          >
            {getIcon(route.name)}
            {isFocused && (
              <Text
                className={`ml-[8px] text-[12px] font-bold  ${
                  isFocused ? "text-white" : "text-neutral-400"
                }`}
                //   className="text-white"
              >
                {label}
              </Text>
            )}
          </AnimatedBtn>
        );
      })}
    </View>
  );
};

export default CustomTab;
