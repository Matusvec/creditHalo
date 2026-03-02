import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../theme/styles';

const PostCard = ({ post, onLike, onComment, isOwnPost, liked, comments = [] }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(post.id, { author: 'You', text: commentText.trim() });
      setCommentText('');
      setShowComments(true);
    }
  };

  const effectiveLiked = liked ?? post.liked;
  const displayComments = [...(post.comments || []), ...(comments || [])];
  const baseLikes = post.likes || 0;
  const likeCount = effectiveLiked ? baseLikes + 1 : baseLikes;

  return (
    <Card
      containerStyle={{
        backgroundColor: colors.card,
        borderRadius: 12,
        borderColor: colors.cardBorder,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', color: colors.text }}>{post.author}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{post.timestamp}</Text>
      </View>
      <Text style={{ color: colors.text, marginBottom: 12 }}>{post.content}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <TouchableOpacity onPress={() => onLike(post.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name={effectiveLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={effectiveLiked ? colors.error : colors.textSecondary}
          />
          <Text style={{ marginLeft: 4, color: colors.textSecondary }}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowComments(!showComments)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={{ marginLeft: 4, color: colors.textSecondary }}>{displayComments.length}</Text>
        </TouchableOpacity>
      </View>
      {showComments && (
        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 12 }}>
          {displayComments.map((c, i) => (
            <View key={i} style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{c.author}: {c.text}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TextInput
              style={[globalStyles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity onPress={handleAddComment} style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );
};

export default PostCard;
