import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useStore } from '../store/useStore';
import { MOCK_POSTS } from '../data/mockPosts';
import { MOCK_COMMUNITIES } from '../data/mockCommunities';
import PostCard from '../components/PostCard';
import { globalStyles, colors } from '../theme/styles';

export default function CommunityScreen() {
  const { posts, addPost, toggleLike, addComment, joinCommunity, joinedCommunities, likedPostIds, postComments, persist } = useStore();
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [findFriendsVisible, setFindFriendsVisible] = useState(false);
  const [joinCommunityVisible, setJoinCommunityVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [postScope, setPostScope] = useState('public');

  const allPosts = [...MOCK_POSTS, ...posts].sort((a, b) => (b.id > a.id ? 1 : -1));

  const handleAddPost = () => {
    if (newPostText.trim()) {
      addPost({
        content: newPostText.trim(),
        author: 'You',
        authorId: 'me',
        timestamp: 'Just now',
        isPublic: postScope === 'public',
        communityId: postScope === 'community' ? joinedCommunities[0] : null,
      });
      persist();
      setNewPostText('');
      setPostModalVisible(false);
    }
  };

  const handleToggleLike = (id) => {
    toggleLike(id);
    persist();
  };

  return (
    <ScrollView style={globalStyles.container}>
      <TouchableOpacity
        style={[globalStyles.button, { marginBottom: 12 }]}
        onPress={() => setPostModalVisible(true)}
      >
        <Text style={globalStyles.buttonText}>Post your newest milestone!</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary, { flex: 1, marginRight: 8 }]}
          onPress={() => setFindFriendsVisible(true)}
        >
          <Text style={globalStyles.buttonText}>Find friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary, { flex: 1 }]}
          onPress={() => setJoinCommunityVisible(true)}
        >
          <Text style={globalStyles.buttonText}>Join a community</Text>
        </TouchableOpacity>
      </View>

      <Text style={[globalStyles.title, { marginBottom: 12 }]}>Feed</Text>
      {allPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleToggleLike}
          onComment={(id, comment) => {
            addComment(id, comment);
            persist();
          }}
          isOwnPost={post.authorId === 'me'}
          liked={likedPostIds[post.id]}
          comments={postComments[post.id]}
        />
      ))}

      <Modal visible={postModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white }]}>
            <Text style={globalStyles.title}>New Post</Text>
            <TextInput
              style={[globalStyles.input, { minHeight: 100, textAlignVertical: 'top', marginBottom: 12 }]}
              placeholder="Share your milestone..."
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
            />
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  padding: 8,
                  marginRight: 8,
                  backgroundColor: postScope === 'public' ? colors.primary : colors.background,
                  borderRadius: 8,
                }}
                onPress={() => setPostScope('public')}
              >
                <Text style={globalStyles.buttonText}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: postScope === 'community' ? colors.primary : colors.background,
                  borderRadius: 8,
                }}
                onPress={() => setPostScope('community')}
              >
                <Text style={globalStyles.buttonText}>Community</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[globalStyles.button, { flex: 1, marginRight: 8 }]} onPress={handleAddPost}>
                <Text style={globalStyles.buttonText}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonSecondary, { flex: 1 }]}
                onPress={() => setPostModalVisible(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={findFriendsVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white }]}>
            <Text style={globalStyles.title}>Find Friends</Text>
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={globalStyles.button} onPress={() => setFindFriendsVisible(false)}>
              <Text style={globalStyles.buttonText}>Send Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setFindFriendsVisible(false)}>
              <Text style={globalStyles.subtitle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={joinCommunityVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white, maxHeight: '80%' }]}>
            <Text style={globalStyles.title}>Join a Community</Text>
            <ScrollView>
              {MOCK_COMMUNITIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.cardBorder,
                  }}
                  onPress={() => {
                    joinCommunity(c.id);
                    persist();
                    setJoinCommunityVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{c.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: colors.text }}>{c.name}</Text>
                    <Text style={globalStyles.subtitle}>{c.members} members</Text>
                  </View>
                  {joinedCommunities.includes(c.id) && <Text>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setJoinCommunityVisible(false)}>
              <Text style={globalStyles.subtitle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
