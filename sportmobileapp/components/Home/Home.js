import { useEffect, useState } from "react";
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
    const nav = useNavigation();

    const loadCates = async () => {
        let res = await Apis.get(endpoints['categories'])
        setCategories(res.data);
    }

    const loadClasses = async () => {
       if (page > 0) {
            try {
                setLoading(true);

                let url = `${endpoints['sportclasses']}?page=${page}`;

                if (q) {
                    url = `${url}?q=${q}`;
                }

                if (cateId) {
                    url = `${url}&category_id=${cateId}`;
                }


                let res = await Apis.get(url);
                setClasses([...classes, ...res.data.results]);

                if (res.data.next === null)
                    setPage(0);
            } catch {
                // ...
            } finally {
                setLoading(false)
            }
       }
    }

    const loadMore = () => {
        if (!loading && page > 0) {
            setPage(page + 1)
        }
    }

    useEffect(() => {
        loadCates();
    }, []);

    // Khi search (q, cateId) thay đổi: reset danh sách + setPage về 1
    useEffect(() => {
        setClasses([]);
        setPage(1);
    }, [q, cateId]);

    // Khi page thay đổi: load lớp học
    useEffect(() => {
        loadClasses();
    }, [page]);


    const search = (value, callback) => {
        setPage(1);
        setClasses([]);
        callback(value);
    }

    return (
        <SafeAreaView style={[MyStyles.p, MyStyles.container]}>
            <View style={[MyStyles.row, MyStyles.wrap]}>
                <TouchableOpacity onPress={() => search(null, setCateId)}>
                    <Chip icon="label" style={MyStyles.m}>Tất cả</Chip>
                </TouchableOpacity>
                {categories.map(c => <TouchableOpacity key={`Cate${c.id}`} onPress={() => search(c.id, setCateId)}>
                    <Chip style={MyStyles.m} icon="label">{c.name}</Chip>
                    </TouchableOpacity>)}
            </View>
             <Searchbar placeholder="Tìm lớp học..."
                       onChangeText={t => search(t, setQ)} value={q} />
            <Text style={MyStyles.subject}>Danh Sách Lớp: </Text>

            <FlatList onEndReached={loadMore} ListFooterComponent={loading && <ActivityIndicator />} 
                        data={classes} renderItem={({ item }) => <List.Item title={item.name} description={item.created_at} 
                                        left={() => <TouchableOpacity onPress={() => nav.navigate('class', {"sportclassId": item.id})}><Image style={MyStyles.avatar} source={{uri: item.image}} /></TouchableOpacity>}/>} />
        </SafeAreaView>

    );
}

export default Home;