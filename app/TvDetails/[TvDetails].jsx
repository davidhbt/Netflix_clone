import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { APIKEY } from "../_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const TvDetails = () => {
  const { Key } = useContext(APIKEY);
  const { TvDetails, image, bk_img, name, date, details } =
    useLocalSearchParams();

  const [isExpanded, setIsExpanded] = useState(false);
  const [recomended, setRecomended] = useState([]);
  const [isRecomendedLoading, setIsRecomendedLoading] = useState(true);

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);

  const CONTINUE_WATCHING_KEY = "continue_watching_list";

  const addOrUpdateContinueWatching = async (item) => {
    try {
      const jsonValue = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
      let list = jsonValue != null ? JSON.parse(jsonValue) : [];

      // Only match by show ID and media type (not episode)
      const existingIndex = list.findIndex((entry) => {
        return entry.id === item.id && entry.media_type === item.media_type;
      });

      if (existingIndex !== -1) {
        // Update the existing entry to reflect the latest episode
        list[existingIndex] = { ...item, lastWatchedAt: Date.now() };
      } else {
        // Add new entry
        list.push({ ...item, lastWatchedAt: Date.now() });
      }

      // Sort by most recently watched
      list.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);

      // Keep only the most recent 3
      list = list.slice(0, 10);

      await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Error updating continue watching list", e);
    }
  };

  console.log(TvDetails, selectedSeason);
  console.log(TvDetails);

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${Key}`,
  };

  const duration = 24 * 60 * 60 * 1000;
  const recomendedCacheKey = "recomended_movie_";

  const fetchTrailer = async () => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/tv/${TvDetails}/videos`,
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

  const fetchRecomended = async () => {
    setIsRecomendedLoading(true);
    try {
      const cacheData = await AsyncStorage.getItem(
        `${recomendedCacheKey}${TvDetails}`
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
        `https://api.themoviedb.org/3/tv/${TvDetails}/recommendations`,
        { headers }
      );

      const newData = res.data.results;
      setRecomended(newData);
      console.log("fetching complete");

      await AsyncStorage.setItem(
        `${recomendedCacheKey}${TvDetails}`,
        JSON.stringify({
          data: newData,
          timeStamp: Date.now(),
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      setIsRecomendedLoading(false);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/tv/${TvDetails}`,
        {
          headers,
        }
      );
      setSeasons(res.data.seasons.filter((s) => s.season_number !== 0));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEpisodes = async () => {
    setIsEpisodesLoading(true);
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/tv/${TvDetails}/season/${selectedSeason}`,
        { headers }
      );
      setEpisodes(res.data.episodes);
    } catch (err) {
      console.log(err);
    } finally {
      setIsEpisodesLoading(false);
    }
  };

  useEffect(() => {
    fetchRecomended();
    fetchSeasons(); // ⬅️ Fetch seasons initially
  }, []);

  useEffect(() => {
    if (selectedSeason) fetchEpisodes(); // ⬅️ Fetch episodes when season changes
  }, [selectedSeason]);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="w-full h-full">
        <ImageBackground
          source={{ uri: `https://image.tmdb.org/t/p/w780${bk_img}` }}
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
                  <Text className="text-white font-bold text-[21px] ">
                    {name}
                  </Text>
                  <Text className="text-neutral-300 text-[12px]">{date}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View className="w-[90%] self-center">
          <View className="flex-row gap-5">
            <TouchableOpacity
              // onPress={() => router.push(`/Movie/${TvDetails}`)}
              onPress={async () => {
                router.push({
                  pathname: `Movie/${TvDetails}`,
                  params: {
                    // uri: `https://multiembed.mov/?video_id=${TvDetails}&tmdb=1&s=${selectedSeason}&e=${ep.episode_number}`,
                    uri: `https://vidsrc.cc/v2/embed/tv/${TvDetails}/${selectedSeason}/1?autoPlay=true`,
                  },
                });
              }}
              activeOpacity={0.6}
              className="flex-1 h-[50px] bg-rose-600 justify-center flex-row items-center rounded-[10px] gap-2"
            >
              <Text className="text-white text-center font-bold text-[16px]">
                Watch
              </Text>
              <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => fetchTrailer()}
              activeOpacity={0.6}
              className="flex-1 h-[50px] border-neutral-600 border-[2px] justify-center flex-row items-center rounded-[10px] gap-2"
            >
              <Text className="text-white text-center font-bold text-[16px]">
                Trailer
              </Text>
              <Ionicons name="play" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className="py-[15px] gap-3">
            <View className="gap-1">
              <Text className="font-bold text-[18px] text-white">Overview</Text>
              <Text
                numberOfLines={isExpanded ? undefined : 3}
                ellipsizeMode="tail"
                className={`text-[12px] ${
                  isExpanded ? "text-white" : "text-neutral-400"
                }`}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                {details}
              </Text>
            </View>

            <View className="gap-2 h-full pb-[30px]">
              <Text className="font-bold text-[18px] text-white">
                Select Episode
              </Text>

              {/* 🔽 Season Picker */}
              <View className="bg-slate-800 rounded-md px-2">
                <Picker
                  selectedValue={selectedSeason}
                  dropdownIconColor="white"
                  onValueChange={(value) => setSelectedSeason(value)}
                  mode="dropdown"
                  style={{ color: "white" }}
                >
                  {seasons.map((s) => (
                    <Picker.Item
                      key={s.id}
                      label={`Season ${s.season_number}`}
                      value={s.season_number}
                    />
                  ))}
                </Picker>
              </View>

              {/* 🎬 Episode Buttons */}
              {isEpisodesLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                episodes.map((ep) => (
                  <TouchableOpacity
                    key={ep.id}
                    // onPress={() =>
                    //   router.push({
                    //     pathname: `/TvEpisode/${ep.id}`, // placeholder route
                    //     params: {
                    //       episodeId: ep.id,
                    //       season: selectedSeason,
                    //       showId: TvDetails,
                    //     },
                    //   })
                    // }
                    onPress={async () => {
                      console.log(ep.id, "asdawd");
                      addOrUpdateContinueWatching({
                        id: TvDetails,
                        media_type: "tv",
                        title: name,
                        poster_path: image,
                        bk_img: bk_img,
                        date: date,
                        rating: 0, // or your rating if you have it
                        details: details,
                        season: selectedSeason,
                        episode: ep.episode_number,
                      });
                      router.push({
                        pathname: `Movie/${TvDetails}`,
                        params: {
                          // uri: `https://multiembed.mov/?video_id=${TvDetails}&tmdb=1&s=${selectedSeason}&e=${ep.episode_number}`,
                          uri: `https://vidsrc.cc/v2/embed/tv/${TvDetails}/${selectedSeason}/${ep.episode_number}?autoPlay=true`,
                        },
                      });
                    }}
                    className="p-3 bg-slate-600 rounded-md mt-2"
                  >
                    <Text className="text-white font-semibold">
                      {ep.episode_number}. {ep.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TvDetails;
