import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
// import { View } from "react-native-web";

const MovieCard = ({
  name,
  date,
  image,
  id,
  bk_img,
  rating,
  details,
  mediaType,
}) => {
  // console.log(bk_img, "wssgg");
  // console.log("wsd");
  // console.log(mediaType, id, name);
  return (
    <Pressable
      className="w-[120px] "
      onPress={() =>
        router.push({
          pathname:
            mediaType === "movie" ? `MovieDetails/${id}` : `TvDetails/${id}`,
          params: { bk_img, image, name, date, rating, details, mediaType },
        })
      }
    >
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w200${image}`,
        }}
        className="h-[160px] rounded-xl"
      />
      <Text
        className="text-[15px] text-white font-bold pt-[5px]"
        numberOfLines={1}
      >
        {name}
      </Text>
      <View className="flex-row gap-1 items-center">
        <Ionicons name="star" color="gold" />
        <Text className="text-white">{rating.toFixed(1)}</Text>
      </View>
      {/* <Text className="text-[13px] text-neutral-400">
        Release Date: {date}{" "}
      </Text> */}
    </Pressable>
  );
};

export default MovieCard;
