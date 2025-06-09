import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import Apis, { authApis, endpoints } from '../../configs/Apis';

const ScheduleCalendar = ({ route }) => {
    const classId = route.params?.classId
    const [schedules, setSchedules] = useState([]);
    const loadSchedules = async () => {
        try {
            let res = await Apis.get(endpoints['schedules'](classId));
            setSchedules(res.data)
        } catch (error) {
            
        }
    }

    useEffect(() => {
        loadSchedules();
    }, []);

    // Nhóm lịch học theo ngày
    const groupedData = schedules.reduce((acc, item) => {
        const date = moment(item.datetime).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    // Chuyển sang dạng SectionList cần
    const sections = Object.entries(groupedData).map(([date, data]) => ({
        title: moment(date).format('dddd - DD/MM/YYYY'),
        data
    }));

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.sectionHeader}>{title}</Text>
            )}
            renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                    <Image source={{ uri: item.sportclass.image }} style={styles.image} />
                    <View style={styles.info}>
                        <Text style={styles.className}>{item.sportclass.name}</Text>
                        <Text>HLV: {item.sportclass.coach.last_name} {item.sportclass.coach.first_name}</Text>
                        <Text>Giờ học: {moment(item.datetime).format('HH:mm')}</Text>
                        <Text>Địa điểm: {item.place}</Text>
                    </View>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginTop: 10
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10
    },
    info: {
        flex: 1
    },
    className: {
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default ScheduleCalendar;
