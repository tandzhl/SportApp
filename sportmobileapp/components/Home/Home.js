import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { Chip, List, Searchbar, Text } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [cateId, setCateId] = useState(null);
    const debounceTimeout = useRef(null);
    const nav = useNavigation();

    const loadCates = async () => {
        let res = await Apis.get(endpoints['categories'])
        setCategories(res.data);
    }

    const loadClasses = async (isNewSearch = false) => {
      if (page > 0 || loading)   {    
            try {
                setLoading(true);

                let params = new URLSearchParams();
                params.append("page", page);

                if (q) params.append("q", q);
                if (cateId !== null) params.append("category_id", cateId);

                let url = `${endpoints['sportclasses']}?${params.toString()}`;

                const res = await Apis.get(url);

                if (isNewSearch)
                    setClasses(res.data.results);
                else
                    setClasses(prev => [...prev, ...res.data.results]);

                if (res.data.next === null)
                    setPage(0); 

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };


    const loadMore = () => {
        if (!loading && page > 0) {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

            debounceTimeout.current = setTimeout(() => {
                setPage(page + 1);
            }, 500);
        }
    };

    useEffect(() => {
        loadCates();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() => {
            loadClasses();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [q, cateId]);

    useEffect(() => {
        if (page > 1) loadClasses();
    }, [page]);

    const search = (value, callback) => { 
        setClasses([]);
        callback(value);
        setPage(1);
    };

    return (
        <SafeAreaView style={[MyStyles.p, MyStyles.container]}>
            <Searchbar placeholder="Tìm lớp học..."
                       onChangeText={t => search(t, setQ)} value={q} />

            <View style={[MyStyles.row, MyStyles.wrap]}>
                <TouchableOpacity onPress={() => search(null, setCateId)}>
                    <Chip icon="label" style={MyStyles.m}>Tất cả</Chip>
                </TouchableOpacity>
                {categories.map(c => <TouchableOpacity key={c.id} onPress={() => search(c.id, setCateId)}>
                    <Chip style={MyStyles.m} icon="label">{c.name}</Chip>
                    </TouchableOpacity>)}
            </View>
             
            <Text style={MyStyles.subject}>Danh Sách Lớp: </Text>

            <FlatList
                data={classes}
                keyExtractor={item => item.id.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading && <ActivityIndicator />}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        description={`HLV: ${item.coach.last_name} ${item.coach.first_name}`}
                        left={() => (
                            <TouchableOpacity onPress={() => nav.navigate('class', { sportclassId: item.id })}>
                                <Image style={MyStyles.avatar} source={{ uri: item.image }} />
                            </TouchableOpacity>
                        )}
                    />
                )}
            />
        </SafeAreaView>

    );
}

export default Home;