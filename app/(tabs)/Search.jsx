import { View, Text, TextInput, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIKEY } from "../_layout";
import axios from "axios";
import { useEffect, useState, useContext, useRef } from "react";
import VerticalMovieCard from "../../Components/ui/VerticalMovieCard";

// import { TextInput } from "react-native-gesture-handler";

const Search = () => {
  const { Key } = useContext(APIKEY);
  const [searchResult, setSearchResult] = useState([]);
  const [search, setSearch] = useState("");
  const searchCacheKey = "searchCache_";
  const typingTimeoutRef = useRef(null);

  const [TopSearch, setTopSearch] = useState({});
  const duration = 24 * 60 * 60 * 1000;
  const cacheKey = "topSearch";
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${Key}`,
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      const trimmed = text.trim();
      if (trimmed.length > 0) {
        fetchSearch(trimmed);
      } else {
        setSearchResult([]);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const fetchSearch = async (query) => {
    setIsSearching(true);
    try {
      const cacheData = await AsyncStorage.getItem(`${searchCacheKey}${query}`);

      if (cacheData) {
        const { data, timeStamp } = JSON.parse(cacheData);
        const isValid = Date.now() - timeStamp < duration;

        if (isValid) {
          console.log("used Cache");
          setSearchResult(data);
          return;
        }
      }
      const encoded_query = encodeURIComponent(query);
      const res = await axios.get(
        `https://api.themoviedb.org/3/search/multi?query=${encoded_query}`,
        { headers }
      );
      const newData = res.data.results.filter(
        (item) => item.media_type !== "person"
      );
      setSearchResult(newData);
      console.log("used Api");

      await AsyncStorage.setItem(
        `${searchCacheKey}${query}`,
        JSON.stringify({
          data: newData,
          timeStamp: Date.now(),
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      console.log("search dune");
    }
  };

  const fetchTop = async () => {
    try {
      const cacheData = await AsyncStorage.getItem(cacheKey);

      if (cacheData) {
        const { data, timeStamp } = JSON.parse(cacheData);
        const isValid = Date.now() - timeStamp < duration;

        if (isValid) {
          setTopSearch(data);
          console.log("used cache");
          return;
        }
      }

      const res = await axios.get(
        "https://api.themoviedb.org/3/trending/all/day?",
        { headers }
      );

      const newData = res.data.results.filter(
        (item) => item.media_type !== "person"
      );
      setTopSearch(newData);
      console.log("used API");

      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: newData,
          timeStamp: Date.now(),
        })
      );
    } catch (err) {
      console.log("err");
    } finally {
      console.log("finished bruvv");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTop();
    // fetchSearch("the walking dead");
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 ">
        <View className="w-full h-[60px]  flex-row p-[10px] px-[15px]">
          <View className="bg-slate-800 h-full w-full  px-[10px] flex-row items-center rounded-lg">
            <Ionicons
              name="search"
              size={20}
              color="white"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Search"
              className="flex-1 items-center text-white font-bold text-[14px]"
              placeholderTextColor={"rgba(255,255,255,0.5)"}
              onChangeText={handleSearchChange} // <-- use this new handler here
              value={search}
            />
            {search.trim().length > 0 && (
              <Ionicons
                name="close-circle"
                size={20}
                color="white"
                onPress={() => setSearch("")}
                // style={{ marginRight: 10 }}
              />
            )}
          </View>
        </View>
        <View className="px-[15px]">
          <Text className="text-white font-bold text-[18px] mb-[10px]">
            Top Searches
          </Text>
          <View className="h-full w-full">
            {search.trim().length > 0 ? (
              <FlatList
                data={searchResult}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
                contentContainerStyle={{
                  paddingBottom: 250,
                }}
                renderItem={({ item }) => <VerticalMovieCard item={item} />}
              />
            ) : (
              <FlatList
                data={TopSearch}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
                contentContainerStyle={{
                  paddingBottom: 250,
                }}
                renderItem={({ item }) => <VerticalMovieCard item={item} />}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;
