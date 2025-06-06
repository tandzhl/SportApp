import { Keyboard, KeyboardAvoidingView, StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Button, Image, FlatList, ScrollView, Alert, Dimensions, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, IconButton } from "react-native-paper";
import Apis, { authApis, endpoints, setupInterceptors } from "../../configs/Apis";
import RenderHTML from "react-native-render-html";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const baseURL = "http://192.168.1.8:8000/";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fullImageURL = (path) => {
  return path?.startsWith("http") ? path : `${baseURL}${path}`;
};

const NewsDetailScreen = ({ route }) => {
  const newfeedId = route.params?.newfeedId;
  const { width } = Dimensions.get("window");
  const [newfeed, setNewfeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submit, setSubmit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const flatListRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // Comment đang chỉnh sửa
  const [editText, setEditText] = useState(""); 

  const navigation = useNavigation();

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setCurrentUser(null);
    }
  };

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await loadUser();

      await authApis(token, navigation.navigate).post(endpoints["newfeed-like"](newfeedId), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      Alert.alert("Error", "Failed to update like status");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    setSubmit(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await authApis(token, navigation.navigate).post(endpoints["comments"](newfeedId), { content: commentText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => [response.data, ...prev]);
      setCommentText("");
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      Alert.alert("Error", "Failed to post comment");
    } finally {
      setSubmit(false);
    }
  };

  const loadMoreComments = async () => {
    if (!nextPage) return;

    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authApis(token,navigation.navigate).get(nextPage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => {
        const existingComments = new Set(prev.map(c => c.id));
        const newComments = res.data.results.filter(c=> !existingComments.has(c.id));
        return [...prev, ...newComments];
      });
      setNextPage(res.data.next);
    } catch (error) {
      console.error("Lỗi khi load comment: ", error);
    }
  };

  const refreshComments = async() => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authApis(token, navigation.navigate).get(`${endpoints["comments"](newfeedId)}?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setComments(res.data.results);
      setNextPage(res.data.next);
    } catch (error) {
      console.error("Lỗi khi refresh comments: ", error);
    }
  };

  const loadData = async () => {
    try {
      await loadUser();
      const token = await AsyncStorage.getItem("access_token");

      if (token) {
        const [response, comments] = await Promise.all([
          authApis(token, navigation.navigate).get(endpoints["newfeed-details"](newfeedId), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          authApis(token, navigation.navigate).get(`${endpoints["comments"](newfeedId)}?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setNewfeed({ ...response.data });
        setLiked(response.data.liked);
        setLikeCount(response.data.like_count);
        setComments(comments.data.results);
        setNextPage(comments.data.next);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load post detail");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, [newfeedId]);

  // Theo dõi trạng thái bàn phím
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const renderComment = ({ item }) => {
    const avaUri = fullImageURL(item.user?.avatar);
    const isValid = item.user?.avatar && item.user.avatar.trim() !== "";
    const isOwnComment = currentUser?.id === item.user?.id; ///

    const handleDeleteConfirm = () => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this comment?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => handleDeleteComment(item.id) },
        ]
      );
    };

    const handleEditComment = () => {
      setEditingComment(item);
      setEditText(item.content);
    };

    const handleCancelEdit=() => {
      setEditingComment(null);
      setEditText("");
      Keyboard.dismiss();
    };

    const handleDeleteComment = async (commentId)=> {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) throw new Error("Token không tồn tại");
        await authApis(token, navigation.navigate).delete(endpoints["comment-detail"](commentId), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await refreshComments();
        Alert.alert("Success", "Comment deleted successfully!", [{ text: "OK" }]); 
      } catch (error) {
        console.error("Lỗi khi xóa bình luận:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to delete comment. Please try again.", [{ text: "OK" }]); 
      }
    };

    const handleUpdateComment = async () => {
      if(!editText.trim()) {
        Alert.alert("Error", "Comment cannot be empty");
        return;
      }
      try{
        const token = await AsyncStorage.getItem("access_token");
        if (!token) throw new Error("Token không tồn tại");
        await authApis(token, navigation.navigate).put(endpoints['comment-detail'](item.id), {content: editText}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        await refreshComments();
        setEditingComment(null);
        setEditText("");
        Keyboard.dismiss();
        Alert.alert("Success", "Comment updated successfully!", [{ text: "OK" }]); 
      } catch (error){
        console.error("Lỗi khi cập nhật bình luận:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to update comment. Please try again.", [{ text: "OK" }]); 
      }
    };

    return (
      <View style={styles.commentContainer}>
        <View style={styles.commentUserContainer}>
          <Image
            source={isValid ? { uri: avaUri } : require("../../assets/no_image.png")}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.commentUser}>{item.user.username}</Text>
          {isOwnComment ? (
            <View style={{ flexDirection: "row", marginLeft: "auto" }}>
              <TouchableOpacity onPress={handleEditComment}>
                <MaterialCommunityIcons name="pencil" size={20} color="#446b50" style={{ marginHorizontal: 5 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteConfirm}>
                <MaterialCommunityIcons name="delete" size={20} color="#f17b77" style={{ marginHorizontal: 5 }} />
              </TouchableOpacity>
            </View>
          ):null}
        </View>
        {editingComment?.id === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInlineInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus={true}
              multiline
            />
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateComment} style={styles.updateButton}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentText}>{item.content}</Text>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <Image
        source={isValidUri ? { uri: imageUri } : require("../../assets/no_image.png")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <RenderHTML
          contentWidth={width - 40}
          source={{ html: newfeed.title }}
          baseStyle={styles.titleText}
        />
        <Text style={styles.dateText}>{formatDate(newfeed.created_at)}</Text>
        <RenderHTML
          contentWidth={width - 40}
          source={{ html: newfeed.content }}
          baseStyle={styles.contentText}
        />
        <View style={styles.interactionContainer}>
          <IconButton
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name={liked ? "cards-heart" : "cards-heart-outline"}
                color={liked ? "#fb6376" : "gray"}
                size={size}
              />
            )}
            onPress={handleLike}
          />
          <Text style={styles.likeCount}>{likeCount}</Text>
        </View>
      </View>
    </>
  );

  if (loading || !newfeed) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#446b" />
      </View>
    );
  }

  const imageUri = fullImageURL(newfeed?.image);
  const isValidUri = newfeed?.image && newfeed.image.trim() !== "";

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 180} 
      >
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => `${item.id}`}
          ListHeaderComponent={renderHeader}
          onEndReached={loadMoreComments}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{paddingBottom: 10}}
        />
        <View style={[styles.commentInputContainer, keyboardVisible && {bottom: 0}]}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            placeholderTextColor="#888"
            color="#000"
          />
          <TouchableOpacity
            onPress={handleCommentSubmit}
            style={[styles.submitButton, submit && styles.disabledButton]}
            disabled={submit}
          >
            {submit ? <ActivityIndicator size = 'small' color = "#fff" /> : <Text style={styles.submitText}>Post</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewsDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  }, image: {
    width: "100%",
    height: 300,
  }, contentContainer: {
    padding: 15,
  }, titleText: {
    color: "#17103a",
    fontSize: 18,
    fontWeight: "bold",
  }, contentText: {
    color: "#17103a",
    fontSize: 15,
  }, dateText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  }, interactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  }, likeCount: {
    color: "#333",
  }, commentContainer: {
    marginBottom: 8,
    backgroundColor: "#fff",
  }, commentUserContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
  }, commentText: {
    fontSize: 15,
    color: "#333",
    margin: 5,
    paddingLeft: 10,
  }, commentUser: {
    fontSize: 15,
    color: "#666",
    marginLeft: 7,
  }, commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    // position: "absolute",
    // bottom: 0,
    // left: 0,
    // right: 0,
  }, commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10, 
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  }, submitButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#446b50',
    borderRadius: 5,
  }, submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  }, loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }, avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  }, cancelButton: {
    backgroundColor: "#8b939c",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  }, updateButton: {
    backgroundColor: "#446b50",
    padding: 10,
    borderRadius: 5,
  }, buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  }, editContainer: {
    margin: 5,
    paddingLeft: 10,
  }, disabledButton: {
    backgroundColor: "#ccc",
  }, editInlineInput: {
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    textAlignVertical: "top",
  }, editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
});