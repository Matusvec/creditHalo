import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './ui';
import { useHaptic } from '../hooks/useHaptic';
import colors from '../theme/colors';
import { springs } from '../theme/tokens';

const PostCard = ({ post, onLike, onComment, isOwnPost, liked, comments = [] }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const heartScale = useSharedValue(1);
  const { trigger } = useHaptic();

  if (!post || post.content == null) return null;

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(post.id, { author: 'You', text: commentText.trim() });
      setCommentText('');
      setShowComments(true);
    }
  };

  const handleLike = () => {
    heartScale.value = withSpring(1.3, springs.bounce);
    setTimeout(() => {
      heartScale.value = withSpring(1, springs.press);
    }, 150);
    trigger('light');
    onLike(post.id);
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const effectiveLiked = liked ?? post.liked;
  const displayComments = [...(post.comments || []), ...(comments || [])];
  const baseLikes = post.likes || 0;
  const likeCount = effectiveLiked ? baseLikes + 1 : baseLikes;

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Animated.View style={heartStyle}>
            <Ionicons
              name={effectiveLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={effectiveLiked ? colors.error : colors.textSecondary}
            />
          </Animated.View>
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>{displayComments.length}</Text>
        </TouchableOpacity>
      </View>
      {showComments && (
        <View style={styles.commentSection}>
          {displayComments
            .filter((c) => c && (c.text != null || c.content != null))
            .map((c, i) => (
              <View key={i} style={styles.comment}>
                <Text style={styles.commentText}>{c.author}: {c.text ?? c.content ?? ''}</Text>
              </View>
            ))}
          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn}>
              <Ionicons name="send" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  author: {
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  content: {
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    color: colors.textSecondary,
    fontSize: 14,
  },
  commentSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
    paddingTop: 12,
  },
  comment: {
    marginBottom: 4,
  },
  commentText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentInput: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  sendBtn: {
    padding: 10,
  },
});

export default PostCard;
