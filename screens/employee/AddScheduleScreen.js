import { useNavigation, useRoute } from "@react-navigation/native";
import React, {useEffect, useState} from "react";
import { Alert, Keyboard, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Button, IconButton, Menu, TextInput } from "react-native-paper";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddScheduleScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { sportClasses = [] } = route.params || {};
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [newSchedule, setNewSchedule] = useState({
        datetime: "", 
        place: "", 
        sportclass_id: null
    });
    const [sportClassMenuVisible, setSportClassMenuVisible] = useState(false);

    const getCurrentDate = () => {
        return new Date();
    }

    const createUTC7DateTime = (date, time) => {
        if (!date || !time) return null;
        
        const combinedDateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            0,
            0
        );
        
        const year = combinedDateTime.getFullYear();
        const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
        const day = String(combinedDateTime.getDate()).padStart(2, '0');
        const hours = String(combinedDateTime.getHours()).padStart(2, '0');
        const minutes = String(combinedDateTime.getMinutes()).padStart(2, '0');
        const seconds = '00';
        const milliseconds = '000';
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+07:00`;
    }

    const formatDateTime = (date, time) => {
        if (!date || !time) return "Select date time";
        
        try {
            const combinedDateTime = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                time.getHours(),
                time.getMinutes()
            );
            
            const day = String(combinedDateTime.getDate()).padStart(2, "0");
            const month = String(combinedDateTime.getMonth() + 1).padStart(2, "0");
            const year = combinedDateTime.getFullYear();
            const hours = String(combinedDateTime.getHours()).padStart(2, "0");
            const minutes = String(combinedDateTime.getMinutes()).padStart(2, "0");
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            console.error("Lỗi format:", error);
            return "Select date time";
        }
    };

    const showDatePicker = () => {
        const currentDate = getCurrentDate();
        DateTimePickerAndroid.open({
            value: selectedDate || currentDate,
            onChange: (event, selectedDateValue) => {
                if (selectedDateValue) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); 
                    const selected = new Date(selectedDateValue);
                    selected.setHours(0, 0, 0, 0);
                    
                    if (selected < today) {
                        Alert.alert("Error", "Cannot select a date in the past.", [{ 
                            text: "OK", 
                            onPress: () => showDatePicker() 
                        }]);
                        return;
                    }
                    
                    console.log("Selected date:", selectedDateValue);
                    setSelectedDate(selectedDateValue);
                    
                    if (selectedTime) {
                        const datetimeString = createUTC7DateTime(selectedDateValue, selectedTime);
                        setNewSchedule((prev) => ({ ...prev, datetime: datetimeString }));
                        console.log("Datetime đã update:", datetimeString);
                    }
                    
                    setTimeout(() => showTimePicker(), 100);
                }
            },
            mode: "date",
            is24Hour: true,
            minimumDate: getCurrentDate(),
        });
    };

    const showTimePicker = () => {
        const currentTime = selectedTime || getCurrentDate();
        DateTimePickerAndroid.open({
            value: currentTime,
            onChange: (event, selectedTimeValue) => {
                if (selectedTimeValue) {
                    console.log("Selected time:", selectedTimeValue);
                    setSelectedTime(selectedTimeValue);
                    
                    if (selectedDate) {
                        const datetimeString = createUTC7DateTime(selectedDate, selectedTimeValue);
                        setNewSchedule((prev) => ({ ...prev, datetime: datetimeString }));
                    }
                }
            },
            mode: "time",
            is24Hour: true,
        });
    };

    const handleAddSave = async () => {
        if (!selectedDate || !selectedTime || !newSchedule.place || !newSchedule.sportclass_id) {
            Alert.alert("Error", "Please fill in all fields.", [{ text: "OK" }]);
            return;
        }
        
        try {
            const token = await AsyncStorage.getItem('access_token');
            
            const datetimeString = createUTC7DateTime(selectedDate, selectedTime);
            
            const payload = {
                datetime: datetimeString,
                place: newSchedule.place,
                sportclass: newSchedule.sportclass_id,
            };
            
            console.log("Dữ liệu payload :", payload); 
            
            await authApis(token, navigation.navigate).post(endpoints['schedules-add'], payload, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            Alert.alert("Success", "Schedule added successfully!", [
                { text: "OK", onPress: () => navigation.navigate("employee-home") },
            ]);
        } catch (error) {
            console.error("Lỗi thêm lịch học: ", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.error || "Failed to add schedule. Please try again.", [{ text: "OK" }]);
        }
    };

    const handleAddCancel = () => {
        Alert.alert(
            "Confirm Exit",
            "Are you sure you want to exit without saving?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => navigation.navigate("employee-home") },
            ]
        );
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 100}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.addContainer} keyboardShouldPersistTaps="handled">
                        <Text style={styles.addTitle}>Add Schedule</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Sport Class</Text>
                            <Menu
                                visible={sportClassMenuVisible}
                                onDismiss={() => setSportClassMenuVisible(false)}
                                anchor={
                                    <TouchableOpacity
                                        onPress={() => setSportClassMenuVisible(true)}
                                        style={[styles.dropdownButton, {borderWidth:1, borderColor: '#ccc', borderRadius: 5, backgroundColor: '#f9f9f9'}]}
                                    >
                                        <Text style={{fontSize: 16, color: '#000', fontWeight:'400'}}>
                                            {sportClasses.find((sc) => sc.id === newSchedule.sportclass_id)?.name || "Select sport class"}
                                        </Text>
                                        <IconButton icon="chevron-down" size={20} iconColor="#ccc" />
                                    </TouchableOpacity>
                                }
                                style={styles.menuContainer}
                            >
                                {sportClasses.map((sportClass) => (
                                    <Menu.Item
                                        key={sportClass.id}
                                        onPress={() => {
                                            setNewSchedule((prev) => ({ ...prev, sportclass_id: sportClass.id }));
                                            setSportClassMenuVisible(false);
                                        }}
                                        title={sportClass.name}
                                        titleStyle={styles.menuItemText}
                                        style={styles.menuItem}
                                    />
                                ))}
                            </Menu>
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Date Time:</Text>
                            <TouchableOpacity onPress={showDatePicker} style={styles.input}>
                                <Text style={styles.inputText}>
                                    {formatDateTime(selectedDate, selectedTime)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Place:</Text>
                            <TextInput
                                style={[styles.input, {color: "#000", height: 25}]}
                                value={newSchedule.place}
                                onChangeText={(text) => setNewSchedule((prev) => ({ ...prev, place: text }))}
                                placeholder="Enter location"
                                color="#000"
                            />
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <Button
                                mode="contained"
                                onPress={handleAddSave}
                                textColor="#fff"
                                style={styles.button}
                            >
                                Save
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleAddCancel}
                                textColor="#fff"
                                style={styles.button}
                            >
                                Exit
                            </Button>
                        </View>    
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingTop: 10
    }, 
    keyboardAvoidingView: {
        flex: 1,
    }, 
    addContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '85%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignSelf: 'center',
        paddingBottom: 20,
    }, 
    addTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#446b50',
        textAlign: 'center',
    }, 
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#000'
    }, 
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    }, 
    inputLabel: {
        fontSize: 16,
        color: '#000',
        marginBottom: 5,
        marginTop: 10,
    }, 
    inputGroup: {
        marginBottom: 10,
        height: 95,
    }, 
    button: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 5,
        backgroundColor: '#446b50',
    }, 
    inputText: {
        fontSize: 16,
        color: '#000',
    }, 
    dropdownText: {
        fontSize: 17,
        color: '#000',
        fontWeight: '400',
    }, 
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 10,
    }, 
    menuContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        maxHeight: 300,
    }, 
    menuItem: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 20,
    }, 
    menuItemText: {
        fontSize: 17,
        color: '#333',
    },
});
