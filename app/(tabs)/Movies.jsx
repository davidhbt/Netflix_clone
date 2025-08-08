import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React, { cache, isValidElement, useEffect, useState } from "react";
import { memo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIKEY } from "../_layout";
import { useContext } from "react";
import MovieCard from "../../Components/ui/MovieCard";

const Movies = () => {
  const { Key } = useContext(APIKEY);
  const moviesCacheKey = "moviesCache";
  const duration = 24 * 60 * 60 * 1000;
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${Key}`,
  };

  const fetchMovies = async (pageNum = 1) => {
    try {
      const cacheData = await AsyncStorage.getItem(
        `${moviesCacheKey}_page${pageNum}`
      );
      if (cacheData) {
        const { data, timeStamp } = JSON.parse(cacheData);
        const isValid = Date.now() - timeStamp < duration;

        if (isValid) {
          console.log("using Cache for page", pageNum);
          if (pageNum === 1) {
            setMovies(data);
          } else {
            setMovies((prev) => {
              const newMovies = data.filter(
                (item) => !prev.some((prevItem) => prevItem.id === item.id)
              );
              return [...prev, ...newMovies];
            });
          }

          return;
        }
      }

      const res = await axios.get(
        // `https://api.themoviedb.org/3/discover/movie/day?page=${pageNum}`,
        `https://api.themoviedb.org/3/discover/movie?page=${pageNum}`,

        { headers }
      );

      console.log("using API for Discover");
      const newData = res.data.results.map((item) => ({
        ...item,
        media_type: "movie", // or "tv" depending on the dataset
      }));

      if (pageNum === 1) {
        setMovies(newData);
      } else {
        setMovies((prev) => {
          const newUniqueMovies = newData.filter(
            (item) => !prev.some((prevItem) => prevItem.id === item.id)
          );
          return [...prev, ...newUniqueMovies];
        });
      }

      await AsyncStorage.setItem(
        `${moviesCacheKey}_page${pageNum}`,
        JSON.stringify({
          data: newData,
          timeStamp: Date.now(),
        })
      );

      if (res.data.page >= res.data.total_pages) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setInitialLoading(false);
      setIsLoadingMore(false);
      console.log("dune");
    }
  };

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <ActivityIndicator size="large" color="white" />;
  };

  useEffect(() => {
    fetchMovies(1);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="w-full h-[60px]  justify-center p-5">
        <Text className="text-slate-300 text-[20px] font-bold">Movies</Text>
      </View>
      <View className="w-full h-full ">
        {/* <Text className="text-rose-500 text-[15px] font-bold mx-5">
          Discover
        </Text> */}
        {initialLoading ? (
          <ActivityIndicator size="large" className="mt-[10px]" />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            key={`flatlist-3`}
            data={movies}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              // <View style={{ flex: 1 / 3 }}>
              <View
                style={{
                  flex: 1 / 3,
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <MovieCard
                  name={item.title}
                  image={item.poster_path}
                  date={item.release_date}
                  id={item.id}
                  bk_img={item.backdrop_path}
                  rating={item.vote_average}
                  details={item.overview}
                  mediaType="movie"
                />
              </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.7}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{
              // paddingHorizontal: 12,
              // paddingVertical: 10,
              // backgroundColor: "#1e293b", // slate-800 like bg, instead of red
              justifyContent: "center",
              paddingBottom: 150,
              // alignItems: "center",
            }}
          />
        )}
        {/* <View style={{ height: 150 }} /> */}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(Movies);
