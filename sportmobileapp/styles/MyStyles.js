import { StyleSheet } from "react-native";

export default StyleSheet.create({
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
        borderRadius: 60
    }, reg_avatar: {
        width: 120,
        height: 120,
        borderRadius: 60
    }, center: {
        alignItems: 'center'
    }, left: {
        alignSelf: 'flex-start'
    }, u_name: {
        fontSize: 40,
        fontWeight: "bold",
        margin: 10
    }, profile: {
        width: 200,
        height: 200,
        borderRadius: 200
    }, txt: {
        fontSize: 20,
        color: "blue"
    }, txt_cen: {
        textAlign: "center"
    }, btn_icon: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#ccc"
    }, btn_add: {
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: "#007bff",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    }, spacing: {
        height: 20,
    }, title: {
        fontSize: 22,
        marginBottom: 20,
        fontWeight: "bold",
    }, label: {
        fontSize: 16,
        marginBottom: 10,
    }, dropdown: {
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
    }, dropdownContainer: {
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 10,
    }, buttonContainer: {
        marginTop: 20,
    }, view_container: {
        padding: 20,
        zIndex: 1000,
    }, card_container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        backgroundColor: '#fff',
    }, card: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        width: '45%',
        elevation: 3,
    }, card_label: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
});