import { FlatList, Image, ScrollView, View } from "react-native";
import { List, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import Apis, { endpoints } from "../../configs/Apis";

const CoachProfile = ({route}) => {
    const { coachId, sportclassId } = route.params;

    const [coach, setCoach] = useState(null);
    const [sportClasses, setSportClasses] = useState([]);
    const [showAll, setShowAll] = useState(false);

    const loadData = async () => {
        try {
            let coach = await Apis.get(endpoints['coach'](sportclassId));
            setCoach(coach.data);

            let classes = await Apis.get(endpoints['classes-of-coach'](coachId));
            setSportClasses(classes.data);
        } catch {

        } finally {
        }
    } 

    useEffect(() => {
        loadData();
    }, [])

    const renderClasses = () => {
        const displayedClasses = showAll ? sportClasses : sportClasses.slice(0, 5);

        return (
            <>
            {displayedClasses.map((cls) => (
                <List.Item
                key={cls.id}
                title={cls.name}
                description={`Ngày tạo: ${cls.created_at ? new Date(cls.created_at).toLocaleDateString() : ''}`}
                left={() => (
                    <Image style={MyStyles.avatar} source={{ uri: cls.image }} />
                )}
                />
            ))}

            {sportClasses.length > 5 && (
                <Text
                onPress={() => setShowAll(!showAll)}
                style={{
                    fontSize: 16,
                    textAlign: "right",
                    marginTop: 4,
                    marginRight: 15,
                    color: "gray",
                    textDecorationLine: "underline",
                }}
                >
                {showAll ? "Ẩn bớt" : "Xem thêm..."}
                </Text>
            )}
            </>
        );
    };


    return(
        <SafeAreaView style={MyStyles.container}>
            <Text style={[MyStyles.txt,{margin: 10}]}>Huấn luyện viên</Text> 

            <View style={{ alignItems: 'center' }}>
                <Image source={{ uri: coach?.avatar }} style={[MyStyles.profile, MyStyles.m]} />
                <Text style={MyStyles.u_name}>
                {coach?.last_name} {coach?.first_name}
                </Text>
            </View>
            <Text style={{color: 'black', fontSize: 16, marginVertical: 4, margin: 4}}>Các khóa học của huấn luyện viên:</Text>
            <ScrollView>
                <View>
                    {renderClasses()}   
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default CoachProfile;