import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/Contexts";
import Apis, { endpoints } from "../../configs/Apis";
import { Button, IconButton, List, Menu } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Coach = () => {
    const user = useContext(MyUserContext);
    const [classes, setClasses] = useState([]);
    const [visibleMenu, setVisibleMenu] = useState(null);
    const openMenu = (id) => setVisibleMenu(id);
    const closeMenu = () => setVisibleMenu(null);
    const nav = useNavigation();

    const loadData = async () => {
        let res = await Apis.get(endpoints['classes-of-coach'](user.id));
        setClasses(res.data);
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <ScrollView>
            <Text style={MyStyles.txt}>Khóa học của huấn luyện viên: </Text>
            {classes.map(cls => (
                <List.Item
                    key={cls.id}
                    title={cls.name}
                    description={`Ngày tạo: ${cls.created_at ? new Date(cls.created_at).toLocaleDateString() : ''}`}
                    left={() => (
                        <Image style={MyStyles.avatar} source={{ uri: cls.image }} />
                    )}
                    right={() => (
                        <Menu visible={visibleMenu === cls.id} onDismiss={closeMenu} 
                                anchor={<IconButton icon="dots-vertical" onPress={() => openMenu(cls.id)}
                                /> } >
                            <Menu.Item
                                onPress={() => {
                                    closeMenu();
                                    nav.navigate('list-students', {
                                        classId: cls.id
                                    });
                                }}
                                title="Danh sách học sinh"
                            />
                            <Menu.Item
                                onPress={() => {
                                    closeMenu();
                                    nav.navigate('schedules-manager', {
                                        classId: cls.id
                                    });
                                }}
                                title="Chỉnh sửa lịch học"
                            />
                        </Menu>
                    )}
                />
            ))}
        </ScrollView>
    );
}

export default Coach;