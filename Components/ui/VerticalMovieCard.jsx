import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const VerticalMovieCard = ({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        if (item.media_type === "movie") {
          router.push({
            pathname: `/MovieDetails/${item.id}`,
            params: {
              bk_img: item.backdrop_path,
              image: item.poster_path,
              name: item.title || "Untitled",
              date: item.release_date || "Unknown",
              rating: item.vote_average || 0,
              details: item.overview || "No overview available.",
              mediaType: item.media_type,
            },
          });
        } else {
          router.push({
            pathname: `/TvDetails/${item.id}`,
            params: {
              bk_img: item.backdrop_path,
              image: item.poster_path,
              name: item.name || "Untitled",
              date: item.first_air_date || "Unknown",
              rating: item.vote_average || 0,
              details: item.overview || "No overview available.",
              mediaType: item.media_type,
            },
          });
        }
      }}
      className="flex-row w-full h-[150px] overflow-hidden shadow-md"
    >
      <Image
        className="h-full w-[100px]"
        source={{
          uri: item.poster_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png",
        }}
      />
      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-white font-semibold text-[16px] mb-1">
            {item?.title || item?.name || "Untitled"}
          </Text>
          <Text
            numberOfLines={3}
            className="text-gray-300 text-[12px] line-clamp-3 mb-2"
          >
            {item?.overview || "No overview available."}
          </Text>
        </View>

        <View className="flex-row flex-wrap items-center gap-3">
          <View className="flex-row items-center space-x-1 gap-[5px]">
            <Ionicons
              name={
                item?.media_type === "movie" ? "film-outline" : "tv-outline"
              }
              size={16}
              color="white"
            />
            <Text className="text-white text-xs">
              {item?.release_date || item?.first_air_date || "Unknown"}
            </Text>
          </View>

          <View className="flex-row items-center space-x-1 gap-[5px]">
            <Ionicons name="language-outline" size={16} color="white" />
            <Text className="text-white text-xs">
              {(item?.original_language || "N/A").toUpperCase()}
            </Text>
          </View>

          <View className="flex-row items-center space-x-1 gap-[5px]">
            <Ionicons name="star-outline" size={16} color="white" />
            <Text className="text-white text-xs">
              {item?.vote_average !== undefined
                ? item.vote_average.toFixed(1)
                : "N/A"}
            </Text>
          </View>

          {!!item?.runtime && (
            <Text className="text-gray-400 text-xs">{item.runtime} min</Text>
          )}
          {!!item?.number_of_episodes && (
            <Text className="text-gray-400 text-xs">
              {item.number_of_episodes} eps
            </Text>
          )}
        </View>

        <View className="flex-row flex-wrap gap-2 pt-1">
          {item?.genres?.map((g, index) => (
            <Text
              key={g.id || index}
              className="text-gray-400 text-[10px] bg-zinc-800 px-2 py-0.5 rounded"
            >
              {g.name || "Genre"}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VerticalMovieCard;
