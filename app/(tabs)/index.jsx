import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState, useRef, act } from "react";
import Carousel from "react-native-reanimated-carousel";
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieCard from "../../Components/ui/MovieCard";
import { useContext } from "react";
import { APIKEY } from "../_layout";
import { router } from "expo-router";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSharedValue } from "react-native-reanimated";
import LoadingScreen from "../../Components/ui/LoadingScreen";
import CategoryList from "../../Components/ui/CategoryList";
import "../../global.css";

const { width: screenWidth } = Dimensions.get("window");

const Index = () => {
  const cacheDuration = 24 * 60 * 60 * 1000;

  const topMoviesCache = "topMoviesCache";
  const [topMovies, setTopMovies] = useState([]);

  const topTvCache = "topTvCache";
  const [topTv, setTopTv] = useState([]);

  const topRatedMoviesCache = "topRatedMoviesCache";
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  const topRatedTvShowCache = "TopRatedTvShowCache";
  const [topRatedTvShow, setTopRatedTvShow] = useState([]);

  const { Key } = useContext(APIKEY);
  const [activeIndex, setActiveIndex] = useState(0);

  const [loadingStates, setLoadingStates] = useState({
    movies: true,
    tvShows: true,
    topRatedMovies: true,
    topRatedTvShow: true,
    // CarouselImage: false,
  });

  const [slideImageLoading, setSlideImageLoading] = useState(true);

  const isLoading = Object.values(loadingStates).some((state) => state);
  // console.log(activeIndex);

  const setLoadingState = (key, state) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: state,
    }));
  };

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${Key}`,
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoadingState("movies", true);
        const cacheData = await AsyncStorage.getItem(topMoviesCache);

        if (cacheData) {
          const { data, timeStamp } = JSON.parse(cacheData);
          const isValid = Date.now() - timeStamp < cacheDuration;

          if (isValid) {
            setTopMovies(data);
            console.log("used Cached Data for Movies");
            return;
          }
        }
        const res = await axios.get(
          "https://api.themoviedb.org/3/trending/movie/day",
          { headers }
        );

        // const newData = res.data.results;
        const newData = res.data.results.map((item) => ({
          ...item,
          media_type: "movie", // or "tv" depending on the dataset
        }));

        setTopMovies(newData);
        console.log("used API");

        await AsyncStorage.setItem(
          topMoviesCache,
          JSON.stringify({
            data: newData,
            timeStamp: Date.now(),
          })
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingState("movies", false);
      }
    };

    const fetchTvData = async () => {
      try {
        setLoadingState("tvShows", true);

        const cacheData = await AsyncStorage.getItem(topTvCache);
        if (cacheData) {
          const { data, timeStamp } = JSON.parse(cacheData);
          const isValid = Date.now() - timeStamp < cacheDuration;

          if (isValid) {
            setTopTv(data);
            console.log("used Cached Data for tvShows");
            return;
          }
        }
        const res = await axios.get(
          "https://api.themoviedb.org/3/trending/tv/day",
          { headers }
        );
        const newData = res.data.results.map((item) => ({
          ...item,
          media_type: "tv", // or "tv" depending on the dataset
        }));

        setTopTv(newData);
        console.log("used API for TVshow");

        await AsyncStorage.setItem(
          topTvCache,
          JSON.stringify({
            data: newData,
            timeStamp: Date.now(),
          })
        );
      } catch (err) {
        console.log(`error fetching tv shows data ${err}`);
      } finally {
        setLoadingState("tvShows", false);
      }
    };

    const fetchTopRatedMovieData = async () => {
      try {
        const cacheData = await AsyncStorage.getItem(topRatedMoviesCache);
        if (cacheData) {
          const { data, timeStamp } = JSON.parse(cacheData);
          const isvalid = Date.now() - timeStamp < cacheDuration;

          if (isvalid) {
            setTopRatedMovies(data);
            console.log("used Cached Data on toprated Movies");
            return;
          }
        }
        const res = await axios.get(
          "https://api.themoviedb.org/3/movie/top_rated?",
          { headers }
        );

        const newData = res.data.results.map((item) => ({
          ...item,
          media_type: "movie", // or "tv" depending on the dataset
        }));

        setTopRatedMovies(newData);
        console.log("used API for Top Rated movies");

        await AsyncStorage.setItem(
          topRatedMoviesCache,
          JSON.stringify({
            data: newData,
            timeStamp: Date.now(),
          })
        );
      } catch (err) {
        console.log(`err in topRatedMovie, ${err}`);
      } finally {
        setLoadingState("topRatedMovies", false);
      }
    };
    const fetchTopRatedTvShowData = async () => {
      try {
        const cacheData = await AsyncStorage.getItem(topRatedTvShowCache);
        if (cacheData) {
          const { data, timeStamp } = JSON.parse(cacheData);
          const isvalid = Date.now() - timeStamp < cacheDuration;

          if (isvalid) {
            setTopRatedTvShow(data);
            console.log("used Cached Data on toprated Movies");
            return;
          }
        }
        const res = await axios.get(
          "https://api.themoviedb.org/3/tv/top_rated?",
          { headers }
        );

        const newData = res.data.results.map((item) => ({
          ...item,
          media_type: "tv", // or "tv" depending on the dataset
        }));

        setTopRatedTvShow(newData);
        console.log("used API for Top Rated Tv shows");

        await AsyncStorage.setItem(
          topRatedTvShowCache,
          JSON.stringify({
            data: newData,
            timeStamp: Date.now(),
          })
        );
      } catch (err) {
        console.log(`err in topRatedTv, ${err}`);
      } finally {
        setLoadingState("topRatedTvShow", false);
      }
    };

    fetchTopRatedTvShowData();
    fetchTopRatedMovieData();
    fetchMovieData();
    fetchTvData();
  }, []);

  const renderCarouselItem = ({ item, index, animationValue }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animationValue.value,
        [-1, 0, 1],
        [0.9, 1, 0.9],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        animationValue.value,
        [-1, 0, 1],
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View
        className="w-[100%] h-[500px] rounded-[20px] overflow-hidden relative justify-center items-center"
        style={[animatedStyle]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: `/MovieDetails/${item.id}`,
              params: {
                MovieDetails: item,
                image: item.poster_path,
                bk_img: item.backdrop_path,
                name: item.title,
                date: item.release_date,
                details: item.overview,
              },
            })
          }
          className="w-[100%] h-[100%] justify-center items-center "
        >
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            }}
            className="w-[100%] h-[100%] object-cover object-center"
            resizeMode="cover"
          />
          {/* <View
            className="absolute bottom-0 left-0 right-0 bg-black/60 p-[10px]"
            // style={styles.carouselTextContainer}
          >
            <Text
              className="text-white text-[18px] font-bold"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-white text-[16px]">
              ⭐ {item.vote_average.toFixed(1)}
            </Text>
          </View> */}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView
        // scrollEventThrottle={30}
        scrollEventThrottle={15}
        showsVerticalScrollIndicator={false}
        className="flex-1 "
      >
        {/* Carousel Section */}
        <View className="h-[530px]  justify-center items-center mb-[10px]">
          <Carousel
            loop
            width={screenWidth}
            // width={"100%"}
            height={450}
            autoPlay={true}
            data={topMovies.slice(0, 10)}
            scrollAnimationDuration={300}
            autoPlayInterval={3000}
            renderItem={renderCarouselItem}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.8,
              parallaxScrollingOffset: 120,
            }}
            // onSnapToItem={(index) => setActiveIndex(index)}
            onSnapToItem={(index) => {
              requestAnimationFrame(() => setActiveIndex(index));
            }}

            // className=""
          />
          <View className="flex items-center gap-3 flex-1 ">
            <Text
              key={activeIndex}
              className="text-white mt-[10px] text-[25px] font-bold   max-w-[85%]"
              numberOfLines={1}
              ellipsizeMode="tail"
              // style={{ maxWidth: 200 }}
            >
              {topMovies[activeIndex]?.title}
            </Text>
            <View className="flex-row gap-10 items-center">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: `/MovieDetails/${topMovies[activeIndex]?.id}`,
                    params: {
                      MovieDetails: topMovies[activeIndex],
                      image: topMovies[activeIndex]?.poster_path,
                      bk_img: topMovies[activeIndex]?.backdrop_path,
                      name: topMovies[activeIndex]?.title,
                      date: topMovies[activeIndex]?.release_date,
                      details: topMovies[activeIndex]?.overview,
                    },
                  })
                }
                className="justify-center  items-center"
              >
                <Ionicons
                  name="information-circle-outline"
                  color={"white"}
                  size={20}
                />
                <Text className="text-white">Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: `/MovieDetails/${topMovies[activeIndex]?.id}`,
                    params: {
                      MovieDetails: topMovies[activeIndex],
                      image: topMovies[activeIndex]?.poster_path,
                      bk_img: topMovies[activeIndex]?.backdrop_path,
                      name: topMovies[activeIndex]?.title,
                      date: topMovies[activeIndex]?.release_date,
                      details: topMovies[activeIndex]?.overview,
                    },
                  })
                }
                className="bg-rose-700 py-[10px] px-[50px] rounded-xl"
              >
                <Text className="text-white font-bold text-[18px]">
                  Watch Now
                </Text>
              </TouchableOpacity>
              <View className="justify-center  items-center">
                <Ionicons name="bookmark-outline" color={"white"} size={20} />
                <Text className="text-white">My list</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Movies List */}
        <CategoryList Title="Trending Movies" data={topMovies} />
        {/* {console.log(topMovies)} */}

        <CategoryList
          Title="Trending TV Shows"
          data={topTv.map((tv) => ({ title: tv.name, ...tv }))}
        />
        <CategoryList Title="top Rated Movies" data={topRatedMovies} />
        <CategoryList
          Title="top Rated TvShows"
          data={topRatedTvShow.map((tv) => ({ title: tv.name, ...tv }))}
        />
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default Index;
