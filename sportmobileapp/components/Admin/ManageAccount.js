import { SafeAreaView } from "react-native-safe-area-context";
import { Button, TextInput, Text} from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import Apis, { authApis, endpoints} from "../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Image, TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from "react-native-picker-select";


const ManageAccount = ({ route }) => {
    const userId = route.params?.userId
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState({});
    const [img, setImg] = useState([])
    const nav = useNavigation()

    const roles = [
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' },
        { label: 'Coach', value: 'coach' },
        { label: 'Employee', value: 'employee' },   
    ];

    const info = [{
        label: 'Tên đăng nhập',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
    }, {
        label: 'Họ và tên lót',
        field: 'first_name',
        icon: 'information',
        secureTextEntry: false
    }, {
        label: 'Tên',
        field: 'last_name',
        icon: 'information',
        secureTextEntry: false
    }, {
        label: 'Email',
        field: 'email',
        icon: 'email',
        secureTextEntry: false
    }];

    const setState = (value, field) => {
        setItems({...items, [field]: value });
        console.log(items);
    }

    const loadData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');

            let res = await authApis(token).get(endpoints['manage-user-by-admin'](userId));
            setUser(res.data)
        } catch {
            
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [])

    const change = async () => {
        if (Object.keys(items).length === 0 && !img?.uri && (!items.role || items.role === user.role)) {
            alert("Bạn chưa thay đổi thông tin nào.");
            return;
        }
        
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const formBody = new FormData();
            for (let key in items) {
                formBody.append(key, items[key]);
            }
            if (img && img.uri) {
                const filename = img.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formBody.append('avatar', {
                    uri: img.uri,
                    name: filename,
                    type: type
                });
            }

            await authApis(token).patch(endpoints['manage-user-by-admin'](userId), formBody,{
                'headers': {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                }
            });
            alert("Cập nhật thành công!");

            setItems({});
            nav.goBack();
        } catch (err) {
            console.error(err);
            alert("Đã xảy ra lỗi khi cập nhật thông tin.");
        } finally {
            setLoading(false);
        }
    };

    const pick = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled) {
                setImg(result.assets[0]);
            }
        }
    }

    return(
        <SafeAreaView>
            <Text style={MyStyles.label}>Danh sách các tài khoản</Text>

            {info.map(i =>  <TextInput key={i.field} style={MyStyles.m}
                                label={i.label}
                                secureTextEntry={i.secureTextEntry}
                                right={<TextInput.Icon icon={i.icon} />}
                                value={items[i.field] ?? user[i.field]} onChangeText={t => setState(t, i.field)} />)}

            <Image source={{ uri: img.uri ?? user.avatar }} style={[MyStyles.profile, MyStyles.m, { alignSelf: 'center' }]} />
            
             <Text style={{ marginTop: 20, marginBottom: 10, fontSize: 16 }}>
                Chọn vai trò người dùng:
            </Text>

            <RNPickerSelect
                onValueChange={(value) => setState(value, "role")}
                items={roles}
                value={items.role ?? user.role}
                placeholder={{ label: "Chọn vai trò...", value: null }}
                style={{
                    inputAndroid: {
                        padding: 5,
                        backgroundColor: "white",
                        borderRadius: 4,
                        fontSize: 16,
                    }
                }}
            />

            <TouchableOpacity style={MyStyles.m} onPress={pick}>
                <Text>Đổi ảnh đại diện... </Text>
            </TouchableOpacity>

            <Button onPress={change} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Cập nhật</Button>

        </SafeAreaView>
    );
}

export default ManageAccount;