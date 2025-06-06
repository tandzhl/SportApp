import { Text, View, FlatList, Image } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { ActivityIndicator, List } from "react-native-paper";

const ListStudents = ({ route }) => {
    const classId = route.params?.classId;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const loadUser = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).get(endpoints.students(classId));

            setStudents(res.data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <SafeAreaView style={{ padding: 10 }}>
            <Text>Học sinh</Text>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                students.map((user, index) => (
                    <List.Item
                        key={index}
                        title={`${user.user.last_name} ${user.user.first_name}`}
                        description={`Ngày tham gia: ${
                            user.joining_date
                                ? new Date(user.joining_date).toLocaleDateString()
                                : ''
                        }`}
                        left={() => (
                            <Image
                                style={MyStyles.avatar}
                                source={{ uri: user.user.avatar }}
                            />
                        )}
                    />
                ))
            )}

            
        </SafeAreaView>
        );
    };

export default ListStudents;
