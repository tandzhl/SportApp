import { View, Text, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import ModalStyles from "../../styles/ModalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";

const AddSchedule = ({ route, navigation }) => {
  const { classId, reload } = route.params;
  const [scheduleData, setScheduleData] = useState({
    day: "",
    month: "",
    year: "",
    hour: "",
    minute: "",
    second: "",
    place: ""
  });

  const handleAdd = async () => {
    try {
        console.log("📦 API URL:", endpoints["add-schedule"]);
        const { day, month, year, hour, minute, second, place } = scheduleData;
        const datetime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
        const token = await AsyncStorage.getItem("token");
        await authApis(token).post(endpoints["add-schedule"], {
            datetime,
            sportclass: classId,
            place
        });

        reload?.(); // gọi lại loadSchedules ở màn trước nếu có
        navigation.goBack();
        } catch (error) {
            console.error("Lỗi thêm lịch học", error);
        }
    };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={ModalStyles.modalTitle}>Thêm lịch học</Text>
      {["day", "month", "year", "hour", "minute", "second", "place"].map((field) => (
        <TextInput
          key={field}
          placeholder={field}
          value={scheduleData[field]}
          onChangeText={(text) => setScheduleData({ ...scheduleData, [field]: text })}
          keyboardType={field !== "place" ? "numeric" : "default"}
          style={[ModalStyles.input, { height: 50 }]}
        />
      ))}

      <View style={ModalStyles.buttonRow}>
        <TouchableOpacity onPress={handleAdd} style={ModalStyles.saveButton}>
          <Text style={ModalStyles.buttonText}>Lưu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ModalStyles.cancelButton}>
          <Text style={ModalStyles.buttonText}>Hủy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddSchedule;