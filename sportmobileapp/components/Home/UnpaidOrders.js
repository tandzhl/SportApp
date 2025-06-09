import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";

const UnpaidOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const loadUnpaidOrders = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem("token");
            const current_user = (await authApis(token).get(endpoints['current-user'])).data

            const res = await authApis(token).get(endpoints["user-orders"](current_user.id));
            const unpaidOrders = res.data.filter(order => !order.is_paid);
            setOrders(unpaidOrders);
        } catch (err) {
            console.error("LOAD UNPAID ORDERS ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnpaidOrders();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <Text style={styles.orderText}>Mã đơn: {item.id}</Text>
            <Text style={styles.orderText}>Giá: {item.price}₫</Text>
            <Text style={styles.orderText}>Thanh toán: {item.is_paid ? "Đã thanh toán" : "Chưa thanh toán"}</Text>
            <TouchableOpacity
                style={styles.payButton}
                onPress={() => navigation.navigate("pay-order", { orderId: item.id })}
            >
                <Text style={styles.payButtonText}>Thanh toán</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={MyStyles.view_container}>
            <Text style={[MyStyles.title, {marginTop: 10}]}>Danh sách đơn chưa thanh toán</Text>
            {orders.length === 0 ? (
                <Text>Không có đơn nào chưa thanh toán.</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    orderCard: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginVertical: 8,
    },
    orderText: {
        fontSize: 16,
        marginBottom: 4,
    }, 
    payButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    payButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default UnpaidOrders;