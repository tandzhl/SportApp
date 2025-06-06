import { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import ModalStyles from "../../styles/ModalStyles";

const UpdateSchedule = ({ route, navigation }) => {
    const { schedule, reload } = route.params;
    const [scheduleData, setScheduleData] = useState({
        day: "",
        month: "",
        year: "",
        hour: "",
        minute: "",
        second: "",
        place: ""
    });

    useEffect(() => {
        const date = new Date(schedule.datetime);
        setScheduleData({
            day: String(date.getDate()).padStart(2, "0"),
            month: String(date.getMonth() + 1).padStart(2, "0"),
            year: String(date.getFullYear()),
            hour: String(date.getHours()).padStart(2, "0"),
            minute: String(date.getMinutes()).padStart(2, "0"),
            second: String(date.getSeconds()).padStart(2, "0"),
            place: schedule.place
        });
    }, [schedule]);

    const handleUpdate = async () => {
        try {
            const { day, month, year, hour, minute, second, place } = scheduleData;
            const datetime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
            const token = await AsyncStorage.getItem("token");

            await authApis(token).put(endpoints["update-schedule"](schedule.id), {
                datetime,
                place
            });

            reload(); // gọi lại loadSchedules ở màn hình trước
            navigation.goBack();
        } catch (err) {
            console.error("❌ Lỗi cập nhật lịch học:", err);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={ModalStyles.modalTitle}>Chỉnh sửa lịch học</Text>
            {["day", "month", "year", "hour", "minute", "second", "place"].map((field) => (
                <TextInput
                    key={field}
                    label={field}
                    value={scheduleData[field]}
                    onChangeText={(text) =>
                        setScheduleData({ ...scheduleData, [field]: text })
                    }
                    keyboardType={field !== "place" ? "numeric" : "default"}
                    style={[MyStyles.input, { marginVertical: 6 }]}
                />
            ))}
            <View style={ModalStyles.buttonRow}>
                    <TouchableOpacity onPress={handleUpdate} style={ModalStyles.saveButton}>
                      <Text style={ModalStyles.buttonText}>Cập nhật</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={ModalStyles.cancelButton}>
                      <Text style={ModalStyles.buttonText}>Hủy</Text>
                    </TouchableOpacity>
            </View>
        </View>
    );
};

export default UpdateSchedule;