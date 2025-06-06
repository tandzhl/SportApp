import { FlatList, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, Button, List, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useContext, useEffect } from "react";
import { useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import RenderHTML from "react-native-render-html";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SClass = ({route}) => {
    const sportclassId = route.params?.sportclassId;
    const [user, setUser] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sportclass, setSportclass] = useState(null);
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    console.log(user);

    const loadData = async () => {
        try{
            setLoading(true);

            let classRes = await Apis.get(endpoints['sportclass-detail'](sportclassId));
            setSportclass(classRes.data);

            let res = await Apis.get(endpoints['schedules'](sportclassId));
            setSchedules(res.data)

            const token = await AsyncStorage.getItem('token');
            
            let user = await authApis(token).get(endpoints['current-user']);
            setUser(user.data)
        } catch{

        }finally{
            setLoading(false);
        }
    }

    const register = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                alert("Bạn cần đăng nhập để đăng ký lớp học.");
                return;
            }

            let res = await authApis(token).post(endpoints['create-order'], {
                sportclass: sportclassId,
                user: user.id,
                price: sportclass.price
            });

            await authApis(token).post(endpoints['register-class'], {
                sportclass: sportclassId,
                user: user.id,
            });

            alert('Đăng ký lớp thành công');
            navigation.navigate('pay-order', {
                orderId: res.data.id,
            })
        
        } catch (err) {
            console.error("REGISTER ORDER ERROR:", err.response?.data || err.message);
            alert("Lỗi khi đăng ký.");
        }
    }

    useEffect(() => {
        loadData();
    }, [sportclassId]);

    const renderItem = ({ item }) => {
        const dateStr = new Date(item.datetime).toLocaleString("vi-VN");

        return (
            <List.Item
                title={dateStr}
                description={`Địa điểm: ${item.place}`}
                descriptionNumberOfLines={2}
                left={props => <List.Icon {...props} icon="calendar" />} />
        );
    };

    const coach = () => {
        navigation.navigate("coach-profile", {
            coachId: sportclass.coach.id,
            sportclassId: sportclass.id,
        }); 
    }
                

    const ListHeader = () => (
        <>
        <Text style={[MyStyles.subject, MyStyles.txt_cen, {marginBottom: 20}]}>{sportclass.name}</Text>

        <Text style={MyStyles.txt}>Mô tả khóa học</Text>

        <RenderHTML contentWidth={width} source={{ html: sportclass.description }} />

        <Text style={MyStyles.txt}>
            Thông tin huấn luyện viên:{" "}
            <TouchableOpacity onPress={coach}>
            <Text style={[MyStyles.txt, { color: "red", textDecorationLine: "underline" }]}>
                {sportclass.coach.last_name} {sportclass.coach.first_name}
            </Text>
            </TouchableOpacity>
        </Text>
        

        <Text style={MyStyles.txt}>Lịch học</Text>
        </>
    );

    const ListFooter = () => (
        <View style={{ paddingVertical: 16 }}>
        <Text style={MyStyles.txt}>Giá đăng ký khóa học: {sportclass.price}đ</Text>
        <Button icon="school" mode="contained" style={{ marginTop: 8 }} onPress={register}>
            Đăng ký
        </Button>
        </View>
    );

    if (loading || !sportclass) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    return (
        <FlatList
        style={MyStyles.container}
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={<Text>Không có lịch học nào.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
        />
    );
};

export default SClass;   