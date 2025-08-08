import { View, Text, FlatList } from "react-native";
import React from "react";
import MovieCard from "./MovieCard";

const CategoryList = ({ Title, data }) => {
  return (
    <View className="px-[10px] py-[3px]">
      <Text className="text-[20px] text-white font-semibold mt-[10px] mb-[10px]">
        {Title}
      </Text>
      <View>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
          renderItem={({ item }) => (
            <MovieCard
              mediaType={item.media_type}
              name={item.title}
              image={item.poster_path}
              date={item.release_date}
              id={item.id}
              bk_img={item.backdrop_path}
              rating={item.vote_average}
              details={item.overview || "Not Found"}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </View>
  );
};

export default CategoryList;
