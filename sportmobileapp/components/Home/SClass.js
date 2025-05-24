import { FlatList, View } from "react-native";
import { ActivityIndicator, List, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useEffect } from "react";
import { useState } from "react";
import Apis, { endpoints } from "../../configs/Apis";

const SClass = ({route}) => {
    const sportclassId = route.params?.sportclassId;
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadSchedules = async () => {
        try{
            setLoading(true);

            res = await Apis.get(endpoints['schedules'](sportclassId));
            setSchedules(res.data)
        } catch{

        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSchedules();
    }, [sportclassId]);

    const renderItem = ({ item }) => {
        const dateStr = new Date(item.datetime).toLocaleString("vi-VN");

        return (
            <List.Item
                title={dateStr}
                left={props => <List.Icon {...props} icon="calendar" />}
            />
        );
    };
    return (
        <View>
            <Text style={MyStyles.subject}>Lịch học</Text>

            {loading ? (
                <ActivityIndicator animating={true} size="large" />
            ) : schedules.length === 0 ? (
                <Text>Không có lịch học nào.</Text>
            ) : (
                <FlatList
                    data={schedules}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
}

export default SClass;   