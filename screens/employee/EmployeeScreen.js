import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView, TextInput } from "react-native";
import { ActivityIndicator, Button, Icon, IconButton, Menu, Modal} from "react-native-paper";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import BottomTabBar from "../../navigators/BottomTabBar"

const MAX_DAYS = 10;

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const timeOptions = ["Morning", "Afternoon", "Evening"]

const getDateWithOffset = (baseDate, offset) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + offset);
    return newDate;
};

const getCurrentDate = () => {
    const now = new Date();
    return now;
}

const getFullDayName = (date) => dayNames[date.getDay()];
const formatDate = (date) => `${monthNames[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}`;
const getTimeCate = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const hours = date.getUTCHours() + 7
    if(hours >= 0 && hours < 12) return "Morning";
    if(hours >= 12 && hours < 17) return "Afternoon";
    return "Evening";
}

const toLocalDateString = (utcDateStr) => {
    const date = new Date(utcDateStr);
    return date.toLocaleDateString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).split(',')[0]; 
};

const formatDateTime = (dateString) => {
    if (!dateString) return "Select date time";
    
    const date = new Date(dateString);
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    
    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const EmployeeScreen = ({navigation}) => {
    const todayRef = useRef(new Date());
    const today = todayRef.current;
    const [startIndex, setStartIndex] = useState(0);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [showFilters, setShowFilters] = useState(false); 
    const [filters, setFilters] = useState({instructor: null, time: null, classType: null});
    const [instructors, setInstructors] = useState([]);
    const [classTypes, setClassTypes] = useState([]);
    const [sportClasses, setSportClasses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [editedSchedule, setEditedSchedule] = useState({datetime: "", place: "", sportclass_id: null});
    const [instructorMenuVisible, setInstructorMenuVisible] = useState(false);
    const [classTypeMenuVisible, setClassTypeMenuVisible] = useState(false);
    const [timeMenuVisible, setTimeMenuVisible] = useState(false);
    const [sportClassMenuVisible, setSportClassMenuVisible] = useState(false);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [dateTimeMode, setDateTimeMode] = useState("date");

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("access_token");
            const res = await authApis(token, navigation.navigate).get(endpoints['schedules'], {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setSchedules(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi khi load lịch học: ", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCoachs = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('access_token');
            const instructorRes = await authApis(token, navigation.navigate).get(endpoints['users-by-role'], {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                params: {
                    role: 'coach',
                }
            });

            const instructorData = instructorRes.data;
            const instructorList = Array.isArray(instructorData) ? instructorData : instructorData.results || [];

            setInstructors(
                instructorList.map((instructor) => ({
                id: instructor.id,
                name: `${instructor.first_name} ${instructor.last_name || ""}`.trim(),
                }))
            );
        } catch (error) {
            console.error("Lỗi khi load coach:", error);
        } finally {
            setLoading(false);
        }
    }
    const loadClassTypes = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const classTypeRes = await authApis(token, navigation.navigate).get(endpoints['categories'], {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const classTypeData = classTypeRes.data;
            const classTypeList = Array.isArray(classTypeData) ? classTypeData : classTypeData.results || [];
            setClassTypes(classTypeList)
        } catch (error) {
            console.error("Lỗi khi load Cate:", error);
        } finally {
            setLoading(false)
        }
    }

    const loadSportClasses = async () => {
        try{
            const token = await AsyncStorage.getItem('access_token');
            const sportClassRes = await authApis(token, navigation.navigate).get(endpoints['sport-class'], {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            const sportClassData = sportClassRes.data;
            const sportClassList = Array.isArray(sportClassData) ? sportClassData : sportClassData.results || [];
            setSportClasses(sportClassList);
        } catch (error) {
            console.error("Lỗi khi load lớp: ", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    loadSchedules(),
                    loadCoachs(),
                    loadClassTypes(),
                    loadSportClasses(),
                ]);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };
        loadData();
    }, []);

    const filterSchedules = () => {
        const selectedDate = getDate(selectedDateIndex);
        const selectedDay = selectedDate.toLocaleDateString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).split(',')[0];

        const result =  schedules.filter((schedule) => {
            const scheduleDate = toLocalDateString(schedule.datetime);
            const timeCategory = getTimeCate(schedule.datetime);
            const matchesDate = scheduleDate === selectedDay;
            const coachFullName = `${schedule.sportclass.coach.first_name} ${schedule.sportclass.coach.last_name || ""}`.trim();
            const matchesInstructor = !filters.instructor || coachFullName === filters.instructor;
            const matchesClassType = !filters.classType || schedule.sportclass.category_id === classTypes.find((cate) => cate.name === filters.classType)?.id;
            const matchesTime = !filters.time || timeCategory === filters.time;

            return matchesDate && matchesInstructor && matchesClassType && matchesTime;
        });
        setFilteredSchedules(result);
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            filterSchedules();
        }, 300);
        return () => clearTimeout(timer);
    }, [schedules, selectedDateIndex, startIndex, filters, classTypes]);

    const handlePrev = () => {
        if (startIndex > 0) {
        setStartIndex(startIndex - 1);
        }
    };

    const handleNext = () => {
        if (startIndex + 2 < MAX_DAYS) {
        setStartIndex(startIndex + 1);
        }
    };

    const dateItems = useMemo(() => {
        return [0, 1, 2].map((i) => {
        const date = getDateWithOffset(today, startIndex + i);
        const isSelected = i === selectedDateIndex;
        return {date, isSelected, key: i};
        });
    }, [startIndex, selectedDateIndex, today]);

    const getDate = (index) => getDateWithOffset(today, startIndex + index);

    const handleSelectFilter = (key, value) => {
        setFilters((prev)=> {
            const newFilters = {
                ...prev,
                [key]: prev[key] === value ? null : value,
            };
            return newFilters;
        });
    };

    const handleMenu = (schedule, event) => {
        setMenuVisible(schedule.id);
        setSelectedSchedule(schedule);
        event.stopPropagation();       
    };

    const updateSchedule = async (scheduleId, updateData) => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await authApis(token, navigation.navigate).put(endpoints['schedules-update'](scheduleId), updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            await loadSchedules();
            Alert.alert("Success", "Schedule updated successfully!", [{ text: "OK" }]); 
        } catch(error) {
            console.error("Lỗi khi update lịch: ", error);
            Alert.alert("Error", "Failed to update schedule. Please try again.", [{ text: "OK" }]); 
        }
    };
    
    const handleUpdate = () => {
        setEditedSchedule({
            datetime: selectedSchedule.datetime,
            place: selectedSchedule.place,
            sportclass_id: selectedSchedule.sportclass.id,
        });      
        setModalVisible(true);
        setMenuVisible(null);
    };

    const deleteSchedule = async (scheduleId) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            await authApis(token, navigation.navigate).delete(endpoints['schedules-delete'](scheduleId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            await loadSchedules();
            Alert.alert("Success", "Schedule deleted successfully!", [{ text: "OK" }]); 
        } catch(error) {
            console.error("Lỗi khi xóa lịch: ", error);
            Alert.alert("Error", "Failed to delete schedule. Please try again.", [{ text: "OK" }]); 
        }
    };

    const handleDelete = () => {
        setMenuVisible(null);
        Alert.alert(
            "Confirm delete", 
            "Are you sure you want to delete this schedule?",
            [
                {text: "Cancel", style: "cancel"},
                {text: "Delete", style: "destructive", onPress: () => deleteSchedule(selectedSchedule.id)},
            ]
        );
    };


    const handleAdd = () => {
        navigation.navigate("employee-add-schedule", { sportClasses });
    };

    const handleSave = async () => {
        setShowDateTimePicker(false);
        setModalVisible(false);
        const payload = {
            datetime: editedSchedule.datetime, 
            place: editedSchedule.place,
            sportclass: editedSchedule.sportclass_id,
        };
        console.log("Dữ liệu gửi API:", payload);
        await updateSchedule(selectedSchedule.id, payload);

        const updatedDate = new Date(editedSchedule.datetime);
        const hoChiMinhOffsetMinutes = -420;
        const localUpdatedDate = new Date(updatedDate.getTime() - hoChiMinhOffsetMinutes * 60 * 1000);

        const todayDate = new Date(today);
        const localTodayDate = new Date(todayDate.getTime() - hoChiMinhOffsetMinutes * 60 * 1000);

        const difDays = parseInt((localUpdatedDate - localTodayDate) / (24 * 60 * 60 * 1000));
        if (difDays >= 0 && difDays < MAX_DAYS) {
            const newStartIndex = Math.max(0, difDays - 1);
            await loadSchedules();
            setStartIndex(newStartIndex);
            setSelectedDateIndex(difDays - newStartIndex);
        }
        setEditedSchedule({ datetime: "", place: "", sportclass_id: null });
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditedSchedule({datetime: "", place: "", sportclass_id: null});
    };

    const showDatePicker=() => {
        setDateTimeMode("date");
        setShowDateTimePicker(true);
    };

    const showTimePicker = () => {
        setDateTimeMode("time");
        setShowDateTimePicker(true);
    };

    const onDateTimeChange = (event, selectedDate) => {
        if (selectedDate) {
            const now = new Date();
            
            if (dateTimeMode === "date") {
                const localDate = new Date(selectedDate);
                localDate.setHours(0, 0, 0, 0);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (localDate < today) {
                    setShowDateTimePicker(false);
                    Alert.alert("Error", "Cannot select a date in the past.", [
                        { text: "OK", onPress: () => {
                            setTimeout(() => {
                                setDateTimeMode("date");
                                setShowDateTimePicker(true);
                            }, 100);
                        }},
                    ]);
                    return;
                }
                
                setEditedSchedule((prev) => ({ ...prev, datetime: localDate.toISOString() }));
                showTimePicker();
                
            } else {
                const existingDatetime = editedSchedule.datetime ? new Date(editedSchedule.datetime) : new Date();
                
                const year = existingDatetime.getFullYear();
                const month = existingDatetime.getMonth();
                const date = existingDatetime.getDate();
                
                const newDateTime = new Date(year, month, date, selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                                
                if (newDateTime < now) {
                    setShowDateTimePicker(false);
                    Alert.alert("Error", "Cannot select time in the past.", [
                        { text: "OK", onPress: () => {
                            setTimeout(() => {
                                setDateTimeMode("time");
                                setShowDateTimePicker(true);
                            }, 100);
                        }},
                    ]);
                    return;
                }
                                
                setEditedSchedule((prev) => ({ ...prev, datetime: newDateTime.toISOString() }));
                setShowDateTimePicker(false);
            }
        } else {
            setShowDateTimePicker(false);
        }
    };

    if(loading) {
        return (
            <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <ActivityIndicator size='large' color='#446b50' />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity style={styles.filterContainer} onPress={()=> setShowFilters(!showFilters)}>
                    <IconButton icon="menu" size={28} iconColor="#446b50" />
                    <Text style={styles.filterText}>Filters</Text>
                </TouchableOpacity>                
            </View>

            {showFilters && (
                <View style={styles.filterPanel}>
                    <Menu
                        visible={instructorMenuVisible}
                        onDismiss={()=> setInstructorMenuVisible(false)}
                        anchor={
                            <TouchableOpacity 
                                onPress={()=> setInstructorMenuVisible(true)}
                                style={styles.dropdownButton}>
                                <Text style={styles.dropdownText}>
                                    {filters.instructor || "Instructor"}
                                </Text>
                                <IconButton icon="chevron-down" size={25} iconColor='#ccc' />
                            </TouchableOpacity>
                        } style={styles.menuContainer}>
                        <Menu.Item
                            onPress={() => {
                                handleSelectFilter("instructor", null);
                                setInstructorMenuVisible(false);
                            }}
                            title="Show all"
                            titleStyle={styles.menuItemText}
                            style={styles.menuItem} />    
                        {instructors.map((instructor) => (
                            <Menu.Item
                                key={instructor.id}
                                onPress={() => {
                                    handleSelectFilter("instructor", instructor.name);
                                    setInstructorMenuVisible(false);
                                }}
                                title={instructor.name}
                                titleStyle={styles.menuItemText}
                                style={styles.menuItem}
                            />
                        ))}
                    </Menu>
                    <Menu
                        visible={classTypeMenuVisible}
                        onDismiss={()=> setClassTypeMenuVisible(false)}
                        anchor={
                            <TouchableOpacity 
                                onPress={()=> setClassTypeMenuVisible(true)}
                                style={styles.dropdownButton}>
                                <Text style={styles.dropdownText}>
                                    {filters.classType || "Class Type"}
                                </Text>
                                <IconButton icon="chevron-down" size={25} iconColor='#ccc' />
                            </TouchableOpacity>
                        } style={styles.menuContainer}>
                        <Menu.Item
                            onPress={() => {
                                handleSelectFilter("classType", null);
                                setClassTypeMenuVisible(false);
                            }}
                            title="Show all" 
                            titleStyle={styles.menuItemText}
                            style={styles.menuItem}/>
                        {classTypes.map((classType) => (
                            <Menu.Item
                                key={classType.id}
                                onPress={() => {
                                    handleSelectFilter("classType", classType.name);
                                    setClassTypeMenuVisible(false);
                                }}
                                title={classType.name}
                                titleStyle={styles.menuItemText}
                                style={styles.menuItem}
                            />
                        ))}
                    </Menu>
                    <Menu
                        visible={timeMenuVisible}
                        onDismiss={()=> setTimeMenuVisible(false)}
                        anchor={
                            <TouchableOpacity 
                                onPress={()=> setTimeMenuVisible(true)}
                                style={styles.dropdownButton}>
                                <Text style={styles.dropdownText}>
                                    {filters.time || "Time"}
                                </Text>
                                <IconButton icon="chevron-down" size={25} iconColor='#ccc' />
                            </TouchableOpacity>
                        } style={styles.menuContainer}>
                        <Menu.Item
                            onPress={() => {
                                handleSelectFilter("time", null);
                                setTimeMenuVisible(false);
                            }}
                            title="Show all" 
                            titleStyle={styles.menuItemText}
                            style={styles.menuItem}/>
                        {timeOptions.map((time) => (
                            <Menu.Item
                                key={time}
                                onPress={() => {
                                    handleSelectFilter("time", time);
                                    setTimeMenuVisible(false);
                                }}
                                title={time}
                                titleStyle={styles.menuItemText}
                                style={styles.menuItem}
                            />
                        ))}
                    </Menu>
                </View>
            )}

            <View style={styles.filterContainer}>
                <IconButton icon="chevron-left" size={37} color={startIndex === 0 ? "#ccc" : "#000"}
                    onPress={handlePrev}
                    disabled={startIndex === 0}/>
                <View style={styles.dateList}>
                {dateItems.map(({ date, isSelected, key }) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setSelectedDateIndex(key)}
                        style={styles.dateItem}>
                        <Text style={[styles.dayText, isSelected && styles.selectedText]}>{getFullDayName(date)}</Text>
                        <Text style={[styles.dateText, isSelected && styles.selectedText]}>{formatDate(date)}</Text>
                        {isSelected && <View style={styles.underSelectedDate} />}
                    </TouchableOpacity>
                ))}
                </View>
                <IconButton icon="chevron-right" size={37} color={startIndex + 2 >= MAX_DAYS - 1 ? "#ccc" : "#000"}
                    onPress={handleNext}
                    disabled={startIndex + 2 >= MAX_DAYS - 1}/>
            </View>

            <FlatList
                data = {filteredSchedules}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <View style={styles.scheduleItem}>
                        <View style={styles.moreContainer}>
                            <View>
                                <Text style={styles.filterResultCateText}>{classTypes.find((cate) => cate.id === item.sportclass.category_id)?.name || "N/A"} - {item.sportclass.name}</Text>
                                <Text style={styles.filterResultCoachText}>{`${item.sportclass.coach.first_name} ${item.sportclass.coach.last_name}`}</Text>          
                            </View>
                            <Menu
                                visible={menuVisible === item.id}
                                onDismiss={()=> setMenuVisible(null)}
                                anchor={
                                    <IconButton icon="dots-vertical" size={20} iconColor= '#000' onPress={(event)=> handleMenu(item, event)} />
                                }
                                style={styles.menuContainer}
                            >
                                <Menu.Item onPress={handleUpdate} title="Update" titleStyle={styles.menuItemText} style={styles.menuItem} />
                                <Menu.Item onPress={handleDelete} title="Delete" titleStyle={styles.menuItemText} style={styles.menuItem} />
                            </Menu>
                        </View>
                        <Text style={styles.dateText}>{formatDateTime(item.datetime)} at {item.place}</Text>
                    </View>
                )}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.errorText}>No schedules available</Text></View>}
            />

            <Modal 
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {setModalVisible(false), setShowDateTimePicker(false);} }
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Edit Schedule</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Datetime:</Text>
                                <TouchableOpacity onPress={showDatePicker} style={styles.input}>
                                    <Text style={styles.inputText}>
                                        {formatDateTime(editedSchedule.datetime)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Place: </Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedSchedule.place}
                                    onChangeText={(text) => setEditedSchedule({ ...editedSchedule, place: text})} 
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Class:</Text>
                                <Menu 
                                    visible={sportClassMenuVisible}
                                    onDismiss={() => setSportClassMenuVisible(false)}
                                    anchor={
                                        <TouchableOpacity
                                            onPress={()=> setSportClassMenuVisible(true)}
                                            style={[styles.dropdownButton, {borderWidth:1, borderColor: '#ccc', borderRadius: 5, backgroundColor: '#f9f9f9'}]} >
                                            <Text style={{fontSize: 16, color: '#000', fontWeight:'400'}}>
                                                {sportClasses.find((sc) => sc.id === editedSchedule.sportclass_id)?.name || "Select sport class" }
                                            </Text>
                                            <IconButton icon="chevron-down" size={20} iconColor="#ccc" />
                                        </TouchableOpacity>
                                    }
                                    style={styles.menuContainer}>
                                    {sportClasses.map((sportClass) => (
                                        <Menu.Item
                                            key={sportClass.id}
                                            onPress={() => {
                                                setEditedSchedule((prev) => ({...prev, sportclass_id: sportClass.id}));
                                                setSportClassMenuVisible(false);
                                            }}
                                            title={sportClass.name}
                                            titleStyle={styles.menuItemText}
                                            style={styles.menuItem}
                                        />
                                    ))}
                                </Menu>
                            </View>                            
                            <View style={styles.modalButtons}>
                                <Button mode="contained" onPress={handleSave} textColor="#fff" style={styles.button}>Save</Button>
                                <Button mode="contained" onPress={handleCancel} textColor="#fff" style={styles.button}>Cancel</Button>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Modal>
            <Modal 
                visible={showDateTimePicker}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowDateTimePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <DateTimePicker
                            value={editedSchedule.datetime ? new Date(editedSchedule.datetime) : getCurrentDate()}
                            mode={dateTimeMode}
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onDateTimeChange}
                            is24Hour={true}
                            minimumDate={getCurrentDate()}
                        />
                    </View>
                </View>
            </Modal> 

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>Add Schedule</Text>
            </TouchableOpacity>
            
            <BottomTabBar navigation={navigation} />
        </View>
    );
}

export default EmployeeScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        paddingHorizontal: 10,
        paddingBottom: 70 // 60
    }, filterText: {
        color: '#446b50',
        fontSize: 18,
        fontWeight: 'bold',
    }, filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }, dateList: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 230,
    }, dateItem: {
        alignItems: 'center',
        marginHorizontal: 15,
    }, dateText: {
        fontSize: 14,
        color: '#666',
    }, dayText: {
        fontSize: 14,
        color: "#446b50",
        fontWeight: 'bold',
    }, selectedText: {
        color: "#f17b77",
        fontWeight: '800'
    }, underSelectedDate: {
        height: 2,
        width: 50,
        backgroundColor: "#f17b77",
        marginTop: 2,
        borderRadius: 1.5,
    }, filterPanel: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderColor: '#ddd',
        borderWidth: 1
    }, errorText: {
        color: '#888',
        fontSize: 16,
    }, emptyContainer: {
        flex: 1,
        justifyContent:'center',
        alignItems: 'center',
        paddingVertical: 20
    }, dropdownText: {
        fontSize: 17,
        color: '#000',
        fontWeight: '400'
    }, dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 10,
    }, menuContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        elevation: 4, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        maxHeight: 300
    }, menuItem: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 20,
    }, menuItemText: {
        fontSize: 17,
        color: '#333',
    }, scheduleItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginVertical: 5,
    }, filterResultCateText: {
        color: '#010101',
        fontSize: 16,
        fontWeight: 'bold',
    }, filterResultCoachText: {
        color: '#333',
        fontSize: 18
    }, moreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }, emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    }, modalOverlay: {
        width: '100%',
        height: '100%'
    }, modalContainer: {
        position: 'absolute',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '85%',
        maxWidth: 400,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignSelf:'center'
    }, modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#446b50',
        textAlign: 'center'
    }, input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: "#000"
    }, modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    }, inputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        marginTop: 10
    }, inputGroup: {
        marginBottom: 10,
        height: 95,
    }, button: {
        flex: 1, 
        marginHorizontal: 5, 
        borderRadius: 5,
        backgroundColor: '#446b50'
    }, inputText: {
        fontSize: 16,
        color: '#333',
    }, addButton: {
        backgroundColor: '#446b50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    }, addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});