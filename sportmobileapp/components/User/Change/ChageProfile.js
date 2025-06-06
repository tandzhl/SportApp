import { SafeAreaView } from "react-native-safe-area-context";
import { Button, TextInput } from "react-native-paper";
import MyStyles from "../../../styles/MyStyles";
import Apis, { authApis, endpoints, getAuthToken } from "../../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import { MyDispatchContext, MyUserContext } from "../../../configs/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Image, Text, TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';

const ChangeProfile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState({});
    const [img, setImg] = useState([])
    const nav = useNavigation()

    const info = [{
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
    }

    const change = async () => {
        if (Object.keys(items).length === 0 && !img?.uri) {
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

            await Apis.patch(endpoints['current-user'], formBody, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }        
                });
            
            let u = await authApis(token).get(endpoints['current-user']);
            dispatch({
                "type": "update",
                "payload": u.data
            });
            alert("Cập nhật thành công!");
            setItems({});
            nav.navigate("Tabs", {
                screen: "profile"
            });
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
            {info.map(i =>  <TextInput key={i.field} style={MyStyles.m}
                                label={i.label}
                                secureTextEntry={i.secureTextEntry}
                                right={<TextInput.Icon icon={i.icon} />}
                                value={items[i.field] ?? user[i.field]} onChangeText={t => setState(t, i.field)} />)}

            <Image source={{ uri: img.uri ?? user.avatar }} style={[MyStyles.profile, MyStyles.m, { alignSelf: 'center' }]} />
            <TouchableOpacity style={MyStyles.m} onPress={pick}>
                <Text>Đổi ảnh đại diện... </Text>
            </TouchableOpacity>
            <Button onPress={change} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Cập nhật</Button>

        </SafeAreaView>
    );
}

export default ChangeProfile;