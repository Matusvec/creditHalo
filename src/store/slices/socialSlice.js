/**
 * Social slice — posts, likes, comments, and community membership.
 * @module socialSlice
 */
const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

/**
 * Creates the social slice for the Zustand store.
 * @param {Function} set - Zustand set function
 * @returns {object} Social state and actions
 */
export const createSocialSlice = (set) => ({
  posts: [],
  likedPostIds: {},
  postComments: {},
  communities: [],
  joinedCommunities: [],

  /**
   * Add a new post to the feed.
   * Uses uuidv4 for the post ID.
   * @param {object} post - Post data (author, content, etc.)
   */
  addPost: (post) =>
    set((state) => ({
      posts: [
        ...state.posts,
        {
          id: uuidv4(),
          ...post,
          likes: 0,
          comments: [],
          liked: false,
        },
      ],
    })),

  /**
   * Toggle the like state for a post.
   * @param {string} id - Post ID
   */
  toggleLike: (id) =>
    set((state) => ({
      likedPostIds: {
        ...state.likedPostIds,
        [id]: !state.likedPostIds[id],
      },
    })),

  /**
   * Append a comment to a post's comment list.
   * @param {string} id - Post ID
   * @param {object} comment - Comment data
   */
  addComment: (id, comment) =>
    set((state) => ({
      postComments: {
        ...state.postComments,
        [id]: [...(state.postComments[id] || []), comment],
      },
    })),

  /**
   * Join a community, ignoring duplicates.
   * @param {string} communityId
   */
  joinCommunity: (communityId) =>
    set((state) => ({
      joinedCommunities: state.joinedCommunities.includes(communityId)
        ? state.joinedCommunities
        : [...state.joinedCommunities, communityId],
    })),
});
