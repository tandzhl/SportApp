import { Image, ScrollView } from "react-native"
import MyStyles from "../../styles/MyStyles"
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useEffect, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/Contexts";
import qs from 'qs';

const Login = () => {
    const info = [{
        label: 'Tên đăng nhập',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
    }, {
        label: 'Mật khẩu',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState();
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);

    const setState = (value, field) => {
        setUser({...user, [field]: value})
    }

    const validate = () => {
        if (Object.values(user).length == 0) {
            setMsg("Vui lòng nhập thông tin!");
            return false;
        }

        for (let i of info)
            if (user[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);
                return false;
            }

        setMsg('');
        return true;
    }

    const login = async () => {
        if (validate() === true) {
            try {
                setLoading(true);
                let res = await Apis.post(endpoints['login'], {
                    username: user.username,
                    password: user.password
                });
                
                await AsyncStorage.setItem('token', res.data.access);  // JWT token
                let u = await authApis(res.data.access).get(endpoints['current-user']);
                dispatch({
                    "type": "login",
                    "payload": u.data
                });

                nav.navigate('Trang chủ')
                
            } catch (ex) {
                if (ex.response) {
                    console.error("Login failed:", ex.response.data);
                    setMsg(ex.response.data.error_description || "Đăng nhập thất bại!");
                } else {
                    console.error("Unknown error:", ex);
                    setMsg("Đã xảy ra lỗi không xác định!");
                }
            } finally {
                setLoading(false);
            }
        }
    }

    if (!user) {
        return <Text>Đang tải...</Text>; // hoặc null
    }

    return (
        <ScrollView>
            
            {info.map(i =>  <TextInput key={i.field} style={MyStyles.m}
                                label={i.label}
                                secureTextEntry={i.secureTextEntry}
                                right={<TextInput.Icon icon={i.icon} />}
                                value={user[i.field]} onChangeText={t => setState(t, i.field)} />)}

          

            <Button onPress={login} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Đăng nhập</Button>
        </ScrollView>
    )
}

export default Login;