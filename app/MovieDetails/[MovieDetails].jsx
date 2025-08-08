import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import React, { cache, memo, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import axios from "axios";
import { APIKEY } from "../_layout";
import { useContext } from "react";
import VerticalMovieCard from "../../Components/ui/VerticalMovieCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
// const Imagebk = styled(ImageBackground);
const MovieDetails = () => {
  const { Key } = useContext(APIKEY);
  const { MovieDetails, image, bk_img, name, date, details } =
    useLocalSearchParams();

  const [isExpanded, setIsExpanded] = useState(false);
  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${Key}`,
  };

  const duration = 24 * 60 * 60 * 1000;
  const recomendedCacheKey = "recomended_movie_";
  const [recomended, setRecomended] = useState([]);
  const [isRecomendedLoading, setIsRecomendedLoading] = useState(true);

  const fetchTrailer = async () => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/${MovieDetails}/videos`,
        { headers }
      );
      const newData = res.data.results;
      const trailer = newData.find((video) => video.type === "Trailer");
      if (trailer) {
        const youtubeUrl = `vnd.youtube://${trailer.key}`;
        Linking.openURL(youtubeUrl).catch((err) =>
          console.error("Failed to open YouTube", err)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  console.log(MovieDetails);
  // console.log(recomended);

  const fetchRecomended = async () => {
    setIsRecomendedLoading(true);
    try {
      const cacheData = await AsyncStorage.getItem(
        `${recomendedCacheKey}${MovieDetails}`
      );

      if (cacheData) {
        const { data, timeStamp } = JSON.parse(cacheData);
        const isValid = Date.now() - timeStamp < duration;
        if (isValid) {
          setRecomended(data);
          console.log("used cache");
          return;
        }
      }

      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/${MovieDetails}/recommendations`,
        { headers }
      );

      const newData = res.data.results;
      setRecomended(newData);
      console.log("fetching complete");

      await AsyncStorage.setItem(
        `${recomendedCacheKey}${MovieDetails}`,
        JSON.stringify({
          data: newData,
          timeStamp: Date.now(),
        })
      );

      setRecomended(newData);
    } catch (err) {
      console.log(err);
    } finally {
      setIsRecomendedLoading(false);
    }
  };

  useEffect(() => {
    fetchRecomended();
  }, []);

  return (
    <SafeAreaView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-slate-900"
    >
      <ScrollView className="w-full h-full">
        <ImageBackground
          source={{
            uri: `https://image.tmdb.org/t/p/w780${bk_img}`,
            // uri: "https://image.tmdb.org/t/p/w500/6WqqEjiycNvDLjbEClM1zCwIbDD.jpg",
          }}
          className="w-full h-[330px] object-cover object-center "
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "#0f172a"]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="p-5 justify-between"
          >
            <Ionicons
              name="arrow-back"
              color={"rgba(255,255,255,0.8)"}
              size={30}
              onPress={() => router.back()}
            />
            <View className="flex-column gap-5">
              <View className="flex-row items-center gap-5 ">
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${image}` }}
                  className="w-[100px] h-[130px] "
                />
                <View className="flex-1">
                  <Text
                    className="text-white font-bold text-[21px] "
                    // numberOfLines={1}
                  >
                    {name}
                  </Text>
                  <Text className="text-neutral-300 text-[12px]">{date}</Text>
                </View>
              </View>
              {/* <View className=""></View> */}
            </View>
          </LinearGradient>
        </ImageBackground>
        <View className="w-[90%] self-center">
          <View className="flex-row gap-5">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `Movie/${MovieDetails}`,
                  params: {
                    // uri: `https://multiembed.mov/?video_id=${MovieDetails}&tmdb=1`,
                    uri: `https://vidsrc.cc/v2/embed/movie/${MovieDetails}?autoPlay=true`,
                  },
                })
              }
              activeOpacity={0.6}
              className="flex-1 h-[50px] bg-rose-600 justify-center flex-row items-center rounded-[10px] gap-2"
            >
              <Text className="text-white  text-center  font-bold text-[16px]">
                Watch
              </Text>
              <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => fetchTrailer()}
              activeOpacity={0.6}
              className="flex-1 h-[50px] border-neutral-600 border-[2px] justify-center flex-row items-center rounded-[10px] gap-2"
            >
              <Text className="text-white  text-center  font-bold text-[16px]">
                Trailer
              </Text>
              <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View className="py-[15px] gap-3">
            <View className="gap-1">
              <Text className={`font-bold  text-[18px] text-white`}>
                OverView
              </Text>
              <Text
                numberOfLines={isExpanded ? undefined : 3}
                ellipsizeMode="tail"
                className={` text-[12px]  ${
                  isExpanded ? "text-white" : "text-neutral-400"
                }`}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                {details}
              </Text>
            </View>
            <View className="gap-2 h-full pb-[30px]">
              <Text className={`font-bold  text-[18px] text-white`}>
                Recomended
              </Text>
              {/* <FlatList
              // onTouchStart={() => isExpanded && setIsExpanded(false)}
              // onScrollBeginDrag={() => isExpanded && setIsExpanded(false)}
              onScroll={() => isExpanded && setIsExpanded(false)}
              data={recomended}
              renderItem={({ item }) => <VerticalMovieCard item={item} />}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
              contentContainerStyle={
                {
                  // paddingBottom: 550,
                  }
                  }
                  /> */}
              <View className="gap-3">
                {isRecomendedLoading ? (
                  <ActivityIndicator size="large" />
                ) : (
                  recomended.map((item) => (
                    <VerticalMovieCard item={item} key={item.id} />
                  ))
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// export default MovieDetails;
export default MovieDetails;
