import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApis, endpoints } from "../../configs/Apis";
import MyStyles from "../../styles/MyStyles";

const PayOrder = ({ route }) => {
    const orderId = route.params?.orderId;
    const [selectedPayment, setSelectedPayment] = useState("null");
    const [open, setOpen] = useState(false);
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([
        { label: "Ngân hàng", value: 1 },
        { label: "Tiền mặt", value: 2 },
        { label: "Momo", value: 3 },
    ]);

    const loadOrder = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            let o = await authApis(token).get(endpoints['get-order'](orderId));
            setOrder(o.data);
        } catch (error) {
            
        }
    }

    const handlePayment = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await authApis(token).post(endpoints["pay-order"](orderId), {
                payment: selectedPayment,
            });
            Alert.alert("Thành công", res.data.detail || "Đã thanh toán đơn hàng!");
        } catch (err) {
            Alert.alert("Lỗi", err.response?.data?.detail || "Thanh toán thất bại");
        }
    };

    useEffect(() => {
        loadOrder();
    }, [])

    return (
        <View style={MyStyles.view_container}>
            <Text style={MyStyles.title}>Trang thanh toán</Text>
            <Text style={MyStyles.label}>Chọn hình thức thanh toán:</Text>

            <DropDownPicker
                open={open}
                value={selectedPayment}
                items={items}
                setOpen={setOpen}
                setValue={setSelectedPayment}
                setItems={setItems}
                placeholder="Chọn hình thức thanh toán"
                style={MyStyles.dropdown}
                dropDownContainerStyle={MyStyles.dropdownContainer}
            />

            <View style={MyStyles.buttonContainer}>
                <Button
                    title={
                        order
                        ? `Thanh toán khóa học - Giá: ${order.price}₫`
                        : "Đang xử lý..."
                    }
                    onPress={handlePayment}
                    color="#4CAF50"
                    disabled={!selectedPayment || !order}
                />
            </View>
        </View>
    );
};

export default PayOrder;
