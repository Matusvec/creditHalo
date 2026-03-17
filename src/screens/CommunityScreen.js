import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { MOCK_POSTS } from '../data/mockPosts';
import { MOCK_COMMUNITIES } from '../data/mockCommunities';
import PostCard from '../components/PostCard';
import {
  GradientBackground,
  AnimatedButton,
  GlassModal,
} from '../components/ui';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useHaptic } from '../hooks/useHaptic';
import colors from '../theme/colors';
import { globalStyles } from '../theme/styles';

/**
 * Wraps a PostCard with a staggered entrance animation.
 * Extracted as a component so hooks are called at the top level.
 */
const AnimatedPostCard = ({ post, index, onLike, onComment, isOwnPost, liked, comments }) => {
  const animStyle = useEntranceAnimation(200 + index * 60);
  return (
    <Animated.View style={animStyle}>
      <PostCard
        post={post}
        onLike={onLike}
        onComment={onComment}
        isOwnPost={isOwnPost}
        liked={liked}
        comments={comments}
      />
    </Animated.View>
  );
};

/**
 * Community screen with premium liquid glass dark UI.
 * Handles posting milestones, finding friends, and joining communities.
 */
export default function CommunityScreen() {
  const {
    posts,
    addPost,
    toggleLike,
    addComment,
    joinCommunity,
    joinedCommunities,
    likedPostIds,
    postComments,
    persist,
  } = useStore();

  const [postModalVisible, setPostModalVisible] = useState(false);
  const [findFriendsVisible, setFindFriendsVisible] = useState(false);
  const [joinCommunityVisible, setJoinCommunityVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [postScope, setPostScope] = useState('public');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { trigger } = useHaptic();

  const headerAnim = useEntranceAnimation(0);
  const actionsAnim = useEntranceAnimation(80);
  const feedLabelAnim = useEntranceAnimation(160);

  const allPosts = [...MOCK_POSTS, ...posts]
    .filter((p) => p && p.id && p.content != null)
    .sort((a, b) => (b.id > a.id ? 1 : -1));

  /** Submit a new post and close the modal. */
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

  const handleJoinCommunity = (id) => {
    joinCommunity(id);
    persist();
    trigger('medium');
    setJoinCommunityVisible(false);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnim]}>
            <Text style={styles.screenTitle}>Community</Text>
            <Text style={styles.screenSubtitle}>
              Share milestones, connect with others
            </Text>
          </Animated.View>

          {/* Action buttons */}
          <Animated.View style={actionsAnim}>
            <AnimatedButton
              title="Post your newest milestone!"
              variant="primary"
              style={styles.primaryBtn}
              onPress={() => setPostModalVisible(true)}
            />
            <View style={styles.secondaryRow}>
              <AnimatedButton
                title="Find friends"
                variant="secondary"
                style={styles.halfBtn}
                onPress={() => setFindFriendsVisible(true)}
              />
              <AnimatedButton
                title="Join a community"
                variant="secondary"
                style={styles.halfBtn}
                onPress={() => setJoinCommunityVisible(true)}
              />
            </View>
          </Animated.View>

          {/* Feed label */}
          <Animated.View style={feedLabelAnim}>
            <Text style={[globalStyles.title, styles.feedLabel]}>Feed</Text>
          </Animated.View>

          {/* Posts */}
          {allPosts.map((post, index) => (
            <AnimatedPostCard
              key={post.id}
              post={post}
              index={index}
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
        </ScrollView>
      </SafeAreaView>

      {/* ── New Post Modal ── */}
      <GlassModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
      >
        <Text style={styles.modalTitle}>New Post</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your milestone..."
          placeholderTextColor={colors.textTertiary}
          value={newPostText}
          onChangeText={setNewPostText}
          multiline
          textAlignVertical="top"
        />

        {/* Scope selector chips */}
        <View style={styles.scopeRow}>
          <TouchableOpacity
            style={[
              styles.scopeChip,
              postScope === 'public' ? styles.scopeChipActive : styles.scopeChipInactive,
            ]}
            onPress={() => setPostScope('public')}
          >
            <Text
              style={[
                styles.scopeChipText,
                postScope === 'public' && styles.scopeChipTextActive,
              ]}
            >
              Public
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.scopeChip,
              postScope === 'community' ? styles.scopeChipActive : styles.scopeChipInactive,
            ]}
            onPress={() => setPostScope('community')}
          >
            <Text
              style={[
                styles.scopeChipText,
                postScope === 'community' && styles.scopeChipTextActive,
              ]}
            >
              Community
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalActions}>
          <AnimatedButton
            title="Post"
            variant="primary"
            style={styles.halfBtn}
            onPress={handleAddPost}
          />
          <AnimatedButton
            title="Cancel"
            variant="ghost"
            style={styles.halfBtn}
            onPress={() => setPostModalVisible(false)}
          />
        </View>
      </GlassModal>

      {/* ── Find Friends Modal ── */}
      <GlassModal
        visible={findFriendsVisible}
        onClose={() => setFindFriendsVisible(false)}
      >
        <Text style={styles.modalTitle}>Find Friends</Text>
        <Text style={styles.modalSubtitle}>
          Invite someone by their phone number
        </Text>
        <TextInput
          style={styles.glassInput}
          placeholder="Enter phone number"
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <AnimatedButton
          title="Send Invite"
          variant="primary"
          style={styles.fullBtn}
          onPress={() => {
            setPhoneNumber('');
            setFindFriendsVisible(false);
          }}
        />
        <AnimatedButton
          title="Cancel"
          variant="ghost"
          style={styles.cancelBtn}
          onPress={() => setFindFriendsVisible(false)}
        />
      </GlassModal>

      {/* ── Join Community Modal ── */}
      <GlassModal
        visible={joinCommunityVisible}
        onClose={() => setJoinCommunityVisible(false)}
      >
        <Text style={styles.modalTitle}>Join a Community</Text>
        <Text style={styles.modalSubtitle}>
          Connect with people on the same journey
        </Text>
        <ScrollView
          style={styles.communityList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {MOCK_COMMUNITIES.map((c, index) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.communityItem,
                index < MOCK_COMMUNITIES.length - 1 && styles.communityItemBorder,
              ]}
              onPress={() => handleJoinCommunity(c.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.communityIcon}>{c.icon}</Text>
              <View style={styles.communityInfo}>
                <Text style={styles.communityName}>{c.name}</Text>
                <Text style={styles.communityMembers}>{c.members} members</Text>
              </View>
              {joinedCommunities.includes(c.id) && (
                <Text style={styles.joinedCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <AnimatedButton
          title="Close"
          variant="ghost"
          style={styles.cancelBtn}
          onPress={() => setJoinCommunityVisible(false)}
        />
      </GlassModal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },
  screenSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Buttons
  primaryBtn: {
    marginBottom: 12,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  halfBtn: {
    flex: 1,
  },
  fullBtn: {
    marginTop: 10,
  },
  cancelBtn: {
    marginTop: 6,
  },

  // Feed
  feedLabel: {
    marginBottom: 8,
    marginTop: 4,
  },

  // Modal shared
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  // New post text area
  textArea: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    minHeight: 110,
    marginBottom: 14,
    textAlignVertical: 'top',
  },

  // Scope selector chips
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scopeChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  scopeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scopeChipInactive: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
  },
  scopeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scopeChipTextActive: {
    color: colors.background,
  },

  // Glass text input (Find Friends)
  glassInput: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },

  // Community list
  communityList: {
    maxHeight: 280,
    marginBottom: 4,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  communityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  communityIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  communityMembers: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  joinedCheck: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});
