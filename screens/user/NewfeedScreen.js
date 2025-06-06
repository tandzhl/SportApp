import React, { useEffect, useState } from "react";
import Apis, { authApis, endpoints, setupInterceptors} from "../../configs/Apis";
import { FlatList, Text, StyleSheet, View, Dimensions, Image, TextInput, ScrollView, Modal, TouchableOpacity } from "react-native";
import { Button, IconButton } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderHTML from "react-native-render-html";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';


const baseURL = 'http://192.168.1.8:8000/';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const fullImageURL = (path) => {
    if (!path) return null;
    return path.startsWith('https') ? path : `${baseURL}${path}`;
}


const categories = [
    { key: '', label: 'All' },
    { key: 'training', label: 'Training tips' },
    { key: 'nutrition', label: 'Nutritional regimen' },
    { key: 'events', label: 'Sporting event' },
];

export default function NewfeedScreen() {
    const navigation = useNavigation();
    const [feeds, setFeeds] = useState([]); 
    const [searchText, setSearchText] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [img, setImg] = useState(null);
    const [postCategory, setPostCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [postPressed, setPostPressed] = useState(false);
    const [cancelPressed, setCancelPressed] = useState(false);
    const [errors, setErrors] = useState({
        title: '',
        content: '',
        category: '',
    });

    const picker=async () => {
        let {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted'){
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                setImg(result.assets[0]);
        }
    }

    const addPost = async() => {
        let hasError = false;
        let newErrors = { title: '', content: '', category: '' };

        if (!postTitle) {
            newErrors.title = 'Tile cannot be blank!';
            hasError = true;
        }
        if (!postContent) {
            newErrors.content = 'Content cannot be blank!';
            hasError = true;
        }
        if (!postCategory) {
            newErrors.category = 'Please select category!';
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;
        const formData = new FormData();
        formData.append('title', postTitle);
        formData.append('content', postContent);
        if(img) {
            formData.append('image', {
                uri: img.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });
        }
        formData.append('category', postCategory);

        if (!postTitle || !postContent || !postCategory) {
            alert("Please fill in all required fields!");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("access_token");
            if(!token) throw new Error ("You must login fisrt!");

            await Apis.post(endpoints['newfeed'], formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPostTitle('');
            setPostContent('');
            setImg(null);
            setPostCategory('');
            setModalVisible(false);
            loadFeeds();
            Alert.alert("Success", "Post successfully!", [{ text: "OK" }]); 
        } catch (error){
            console.error('Error adding post:', error);
            Alert.alert("Error", "Post fail! Please try again.", [{ text: "OK" }]); 
        }
    };

    const handlePost = () => {
        setPostPressed(true);
        addPost();
        setTimeout(() => setPostPressed(false), 300);
    };

    const handleCancel=() => {
        setCancelPressed(true);
        setModalVisible(false);

        setTimeout(()=> setCancelPressed(false), 300);
    };

    const loadFeeds = async () =>{
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            let params = {};
            if(searchText) params.search = searchText;
            if(selectedCategory) params.category = selectedCategory;

            const res = await authApis(token, navigation.navigate).get(endpoints['newfeed'], { params,
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
             });
            setFeeds(res.data.results || res.data);
        } catch (error) {
            console.error("Error loading newfeed: ", error);
            setFeeds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer = setTimeout(()=>{
            loadFeeds();
        }, 500);
        return ()=> clearTimeout(timer);
    }, [searchText, selectedCategory]);

    const renderItem = ({item}) => {
        const {width}=Dimensions.get("window");
        const imageUri = fullImageURL(item.image);
        const isValidUri = item.image && item.image.trim() !== "";

        return (
            <View >
                <TouchableOpacity style={styles.itemContainer} onPress={ ()=> navigation.navigate('newfeed-detail', {newfeedId: item.id})}>
                    <Image source={isValidUri ? {uri: imageUri} : require('../../assets/no_image.png')} style={styles.image} resizeMode='cover' />
                    <View style={styles.textContainer}>
                        <RenderHTML
                            contentWidth={width - 120}
                            source={{html: item.title}}
                            baseStyle={{ color: '#17103a', fontSize: 16 }}
                        />
                        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                    </View> 
                </TouchableOpacity>
                
            </View>
        );
    }; 

    return (
        <View style={{flex:1}}>
            <View style={styles.menuContainer}>
                <Button style={styles.addButton} icon={({ size }) => (
                    <Icon name="arrow-down-drop-circle-outline" size={14} color={"#5d7b6f"} /> )}
                    mode="contained" onPress={() => {setSelectedCategory(selectedCategory?'': 'open')}} labelStyle={{fontSize: 12, color: "#5d7b6f", fontWeight: '100'}} >TOPICS</Button>
                <View style={styles.rightSideContainer}>
                    <TouchableOpacity onPress={()=> setModalVisible(true)}>
                        <IconButton icon="pencil-box-outline" size={25} iconColor="#5d7b6f"></IconButton>
                    </TouchableOpacity>
                    <Modal 
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalView}>
                                <ScrollView>
                                    <Text style={styles.modalTitle}>New post</Text>
                                    <TextInput 
                                        style = {styles.input}
                                        value={postTitle}
                                        onChangeText={setPostTitle}
                                        placeholder="Title..."
                                    />
                                    {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
                                    <TextInput
                                        style = {styles.input}
                                        value={postContent}
                                        onChangeText={setPostContent}
                                        placeholder="Content..."
                                        multiline
                                    />
                                    {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}
                                    <Text style={{ margin: 5, marginTop: 10 }}>Choose category</Text>
                                    <View >
                                    {categories.slice(1).map((cate) => (
                                        <TouchableOpacity
                                            key={cate.key}
                                            style={[
                                                styles.categoryItem,
                                                postCategory === cate.key && styles.selectedCategoryItem
                                            ]}
                                            onPress={() => setPostCategory(cate.key)}
                                        >
                                            <Text style={{ color: '#333' }}>{cate.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    </View>
                                    {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
                                    <TouchableOpacity style={styles.imgText} onPress={picker}>
                                        <Text>Choose image...</Text>
                                        {img && (
                                            <Image 
                                                source={{uri: img.uri}}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <View style ={styles.menuContainer}>
                                        <TouchableOpacity
                                            onPress={handlePost}
                                            style={[styles.chooseBtn, postPressed && styles.pressedBtn]}>
                                            <Text style={styles.postBtnText}>Post</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleCancel}
                                            style={[styles.chooseBtn, cancelPressed && styles.pressedBtn]}>
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                <TouchableOpacity onPress={()=>setShowSearch(!showSearch)}>
                    <IconButton icon="magnify" size={25} iconColor="#5d7b6f" ></IconButton>
                </TouchableOpacity>
              </View>
            </View>

            {showSearch && (
                <TextInput style = {styles.input}
                    placeholder="Find post ..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor='#5d7b6f'
                    color='#5d7b6f'
                />
            )}

            {selectedCategory === 'open' && (
                <View style = {styles.categoryContainer}>
                    {categories.map((cate)=> (
                        <TouchableOpacity key={cate.key} onPress={()=> setSelectedCategory(cate.key)}
                            style={[styles.categoryButton, selectedCategory === cate.key && styles.selectedCategoryItem,]} >
                            <Text style={styles.textLabel}>{cate.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loading ? (
                <Text style = {{ textAlign: 'center', marginTop: 20, color: '#5d7b6f' }}>Loading...</Text>
            ) : feeds && feeds.length === 0 ? (
                <Text style={{textAlign: 'center', marginTop: 20, color: '#5d7b6f'}}>Doesn't have any post exist</Text>
            ) : (
                <FlatList 
                    data={feeds}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}/>
            )}
            
        </View>
    )

}

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        flexDirection: "row",
        marginVertical: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
    }, menuContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }, rightSideContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }, title: {
        fontSize: 16,
    }, image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: '#eee',
    }, textContainer: {
        flex: 1,
    }, dateText: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
    }, addButton: {
        backgroundColor: null,
    }, input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 8,
        marginTop: 12
    }, categoryContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        marginBottom: 5, 
    }, categoryButton: {
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    }, categoryItem: {
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 10,
    },textLabel: {
        color: "#5d7b6f",
    }, selectedCategoryItem: { 
        backgroundColor: '#f7c0aa' 
    }, feedItem: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingBottom: 8,
    }, list: {
        paddingBottom: 20 
    }, modalContainer: { 
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    }, modalView: {
        margin: 20,
        backgroundColor: '#446b50',
        padding: 8, 
        borderRadius:5,
    }, modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        padding: 10,
        marginLeft: 20,
    }, imgText: {
        margin: 4,
    }, chooseBtn: {
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 35,
    }, postBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight:'bold',
    }, cancelBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight:'bold',
    }, pressedBtn: {
        backgroundColor: '#3e5c50',
        transform: [{scale: 0.97}],
    }, errorText: {
        color: '#f17b77',
        marginBottom: 10
    }
});