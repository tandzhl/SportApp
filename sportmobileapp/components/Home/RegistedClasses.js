import { View } from "react-native";
import { Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";

const RegistedClasses = () => {
    
    return(
        <View>
            <Text style={MyStyles.label}>Các khóa học bạn đã đăng ký:</Text>
        </View>
    );
}

export default RegistedClasses;