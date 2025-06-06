import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { useContext, useEffect, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/MyContexts";

const Login = () => {
    useEffect(() => {
        const clearData = async () => {
            await AsyncStorage.clear();
        };

        clearData();
        }, []);


    const info = [{
        label: "Tên đăng nhập",
        field: "username",
        secureTextEntry: false,
        icon: "text"
    }, {
        label: "Mật khẩu",
        field: "password",
        secureTextEntry: true,
        icon: "eye"
    }];

    const [user, setUser] = useState({});
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);

    const setState = (value, field) => {
        setUser({...user, [field]: value});
    }


    const validate = () => {
        for (let i of info)
            if (!(i.field in user)  || user[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);
                return false;
            }


        return true;
    }

    const login = async () => {
        if (validate() === true) {
            setLoading(true);
            try {
                let res = await Apis.post(endpoints['login'], {
                    ...user,
                    'client_id': 'BDRa0k4EDDOAIqiMIhJnomA9Ujo5vUXC0BZXdTGY',
                    'client_secret': 't1VC0eR2cqDO9iJ7WsjOLPkEFFhFwvFvgie4JsGvenRZoAcQoKNibKL4qGxqQvo9GbZwhSCALY0Yrm2k6fvHAJD6iJzshy3d7EnTYBQHdqAznGOijEpAI5VWXJGKEtU6',
                    'grant_type': 'password'
                });
                if (!res.data.access || !res.data.refresh) {
                    throw new Error("Invalid token response from server");
                }
                await AsyncStorage.setItem('access_token', res.data.access);
                await AsyncStorage.setItem('refresh_token', res.data.refresh);

                const api = await authApis(res.data.access, nav.navigate);
                let u = await api.get(endpoints['current-user']);   
                console.log("Current user :", u.data);
                const userData = u.data;
        
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                dispatch({
                    "type": "login",
                    "payload": userData,
                });

            } catch(ex) {
                console.error("Login error:", ex.response ? ex.response.data : ex.message);
                setMsg("Login failed! Please check your information again!");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <ScrollView>
            <HelperText style={styles.m} type="error" visible={msg}>
                {msg}
            </HelperText>
            {info.map(i => <TextInput value={user[i.field]} 
                                        onChangeText={t => setState(t, i.field)} 
                                        style={styles.m} key={`${i.label}${i.field}`} 
                                        label={i.label} secureTextEntry={i.secureTextEntry} 
                                        right={<TextInput.Icon icon={i.icon} />}/>)}

            <Button onPress={login} disabled={loading} loading={loading} mode="contained" style={styles.m}>Đăng nhập</Button>
        </ScrollView>
    );
}

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1
    }, subject: {
        fontSize: 30,
        fontWeight: "bold",
        color: "blue"
    }, row: {
        flexDirection: "row"
    }, wrap: {
        flexWrap: "wrap"
    }, m: {
        margin: 5
    }, p: {
        padding: 5
    }, avatar: {
        width: 80,
        height: 80,
        borderRadius: 50
    }
});