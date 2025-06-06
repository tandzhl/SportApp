import { Image, ScrollView, TouchableOpacity, View,} from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";

const CreateUser = () => {
    const roles = [
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' },
        { label: 'Coach', value: 'coach' },
        { label: 'Employee', value: 'employee' },   
    ];

    const info = [{
        label: "Tên",
        field: "first_name",
        secureTextEntry: false,
        icon: "text"
    }, {
        label: "Họ và tên lót",
        field: "last_name",
        secureTextEntry: false,
        icon: "text"
    }, {
        label: "Tên đăng nhập",
        field: "username",
        secureTextEntry: false,
        icon: "text"
    }, {
        label: "Mật khẩu",
        field: "password",
        secureTextEntry: true,
        icon: "eye"
    }, {
        label: "Xác nhận mật khẩu",
        field: "confirm",
        secureTextEntry: true,
        icon: "eye"
    }];

    const [user, setUser] = useState({});
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    
    const setState = (value, field) => {
        setUser({...user, [field]: value});
    }

    const pick = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled) {
                setState(result.assets[0], "avatar");
            }
        }
    }

    const validate = () => {
        for (let i of info)
            if (!(i.field in user)  || user[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);
                return false;
            }

        if (user.password !== user.confirm) {
            setMsg("Mật khẩu không khớp!");
            return false;
        }

        return true;
    }

    const register = async () => {
        if (validate() === true) {
            try {
                setLoading(true);

                const roleToUse = user.role || 'member';
                
                let form = new FormData();
                for (let key in user)
                    if (key !== 'confirm') {
                        if (key === 'avatar') {
                            form.append("avatar", {
                                uri: user.avatar?.uri,
                                name: "avatar.jpg",
                                type: "image/jpeg"
                            });
                        } else
                            form.append(key, user[key]);
                    }

                form.append("role", roleToUse);

                await Apis.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                });
                nav.navigate("Tabs", {
                    screen: "Trang chủ"
                })
            } catch(ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    return(
        <ScrollView style={MyStyles.container}>
            <View style={MyStyles.center}>
            {user.avatar && <Image source={{uri: user.avatar.uri}} style={MyStyles.reg_avatar} />}
            </View>
            <HelperText style={MyStyles.m} type="error" visible={msg}>
                {msg}
            </HelperText>
            {info.map(i => <TextInput style={MyStyles.m} value={user[i.field]} onChangeText={t => setState(t, i.field)} 
                                    label={i.label} key={`${i.label}${i.field}`} 
                                    secureTextEntry={i.secureTextEntry}
                                    right={<TextInput.Icon icon={i.icon} />}/>)}

            <Text style={{ marginTop: 20, marginBottom: 10, fontSize: 16 }}>
                Chọn vai trò người dùng:
            </Text>

            <RNPickerSelect
                onValueChange={(value) => setState(value, "role")}
                items={roles}
                value={user.role}
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
                <Text>Chọn ảnh đại diện... </Text>
            </TouchableOpacity>
            
            <Button onPress={register} disabled={loading} loading={loading} mode="contained" style={MyStyles.m}>Đăng ký</Button>
        </ScrollView>
    );
}

export default CreateUser;