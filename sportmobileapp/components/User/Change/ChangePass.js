import { SafeAreaView } from "react-native-safe-area-context";
import { Button, HelperText, TextInput } from "react-native-paper";
import MyStyles from "../../../styles/MyStyles";
import Apis, { authApis, endpoints, getAuthToken } from "../../../configs/Apis";
import { use, useContext, useEffect, useState } from "react";
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
    const [msg, setMsg] = useState(null);
    const nav = useNavigation()

    const info = [{
        label: 'Mật khẩu cũ',
        field: 'old_pass',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'Mật khẩu mới',
        field: 'new_pass',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'Xác nhận mật khẩu',
        field: 'confirm',
        icon: 'eye',
        secureTextEntry: true
    }];

    const setState = (value, field) => {
        setItems({...items, [field]: value });
    }

    const validate = () => {
        for (let i of info)
            if (!(i.field in items)  || user[i.items] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);
                return false;
            }

        if (items.new_pass !== items.confirm) {
            setMsg("Mật khẩu không khớp!");
            return false;
        }

        return true;
    }

    const change = async () => {
        if(validate() === true) {
          try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const formBody = new FormData();
            for (let key in items) {
              if(key === 'new_pass' )
                formBody.append('password', items[key]);
            }

            console.log(formBody);

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
        }
    };

    return(
        <SafeAreaView>
            <HelperText style={MyStyles.m} type="error" visible={msg}>
                {msg}
            </HelperText>
            {info.map(i =>  <TextInput key={i.field} style={MyStyles.m}
                                label={i.label}
                                secureTextEntry={i.secureTextEntry}
                                right={<TextInput.Icon icon={i.icon} />}
                                value={items[i.field] ?? user[i.field]} onChangeText={t => setState(t, i.field)} />)}

            <Button onPress={change} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Cập nhật</Button>

        </SafeAreaView>
    );
}

export default ChangeProfile;