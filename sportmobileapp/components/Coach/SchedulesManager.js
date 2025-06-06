import { Alert, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import { FlatList } from "react-native-gesture-handler";
import { ActivityIndicator, IconButton, Modal, TextInput } from "react-native-paper";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

const SchedulesManager = ({route}) => {
    const classId = route.params?.classId;
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation()
    const [scheduleData, setScheduleData] = useState({
        day: "",
        month: "",
        year: "",
        hour: "",
        minute: "",
        second: "",
        place: ""
    });
    
    const loadSchedules = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(endpoints.schedules(classId));
            
            setSchedules(res.data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async () => {
        try {
            const { day, month, year, hour, minute, second, place } = scheduleData;
            const datetime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

            const token = await AsyncStorage.getItem("token");
            await authApis(token).post(endpoints.schedules(classId), {
                datetime,
                place
            });

            setModalVisible(false);
            setScheduleData({
                day: "",
                month: "",
                year: "",
                hour: "",
                minute: "",
                second: "",
                place: ""
            });

            loadSchedules();
        } catch (error) {
            console.error("Lỗi khi thêm lịch:", error);
        }
    };
    
    useEffect(() => {
        loadSchedules();
    }, []);

    const handleEdit = (schedule) => {
        navigation.navigate("update-schedule", {
            schedule, 
            reload: loadSchedules
        });
    };
    
    const handleDelete = (id) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa lịch học này?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            console.log(id);
                            await authApis(token).delete(endpoints['delete-schedule'](id));
                            loadSchedules(); // reload lại danh sách sau khi xóa
                        } catch (error) {
                            console.error("❌ Lỗi khi xóa lịch học:", error);
                            Alert.alert("Lỗi", "Không thể xóa lịch học.");
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const renderSchedule = ({ item }) => (
        <View style={MyStyles.btn_icon}>
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold" }}>{item.sportclass.name}</Text>
                <Text>🕒 {moment(item.datetime).format("HH:mm DD/MM/YYYY")}</Text>
                <Text>📍 {item.place}</Text>
            </View>

            <View style={{ flexDirection: "row" }}>
                <IconButton
                    icon="pencil"
                    size={20}
                    iconColor="#007bff"
                    onPress={() => handleEdit(item)}
                />
                <IconButton
                    icon="trash-can"
                    size={20}
                    iconColor="#dc3545"
                    onPress={() => handleDelete(item.id)}
                />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={[MyStyles.txt, {margin: 10}]}>Chỉnh sửa lịch học</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={schedules}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSchedule}
                />
            )}

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("add-schedule", {
                    classId: classId,
                    reload: loadSchedules
                    })
                }
                style={MyStyles.btn_add}
                >
                <Text style={{ color: "white", fontSize: 30 }}>+</Text>
            </TouchableOpacity>
        </View>
        
    );
}

export default SchedulesManager;