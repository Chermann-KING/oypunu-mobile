/**
 * @fileoverview Community Service Interface
 * Follows SOLID principles - Single Responsibility for community management
 */

export interface Community {
  id: string;
  name: string;
  description: string;
  language: string;
  isPublic: boolean;
  memberCount: number;
  postCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  rules?: string[];
  tags?: string[];
  avatar?: string;
  banner?: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'announcement' | 'word_share';
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isPinned: boolean;
  tags?: string[];
  relatedWordId?: string; // For word_share posts
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
  parentId?: string; // For nested comments
  replies?: PostComment[];
}

export interface CommunityMember {
  userId: string;
  username: string;
  avatar?: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  contributionsCount: number;
  lastActiveAt: string;
}

export interface CommunityActivity {
  id: string;
  communityId: string;
  type: 'member_joined' | 'post_created' | 'word_shared' | 'milestone_reached';
  userId: string;
  username: string;
  description: string;
  timestamp: string;
  relatedId?: string;
}

/**
 * Community service interface
 * Handles community interactions and management
 */
export interface ICommunityService {
  // Community discovery and management

  /**
   * Get all public communities
   */
  getPublicCommunities(limit?: number, offset?: number): Promise<{
    communities: Community[];
    total: number;
    hasMore: boolean;
  }>;

  /**
   * Search communities by name or language
   */
  searchCommunities(query: string, language?: string): Promise<Community[]>;

  /**
   * Get community details by ID
   */
  getCommunityById(id: string): Promise<Community>;

  /**
   * Get communities user has joined
   */
  getUserCommunities(): Promise<Community[]>;

  /**
   * Get suggested communities for user
   */
  getSuggestedCommunities(): Promise<Community[]>;

  /**
   * Join a community
   */
  joinCommunity(communityId: string): Promise<void>;

  /**
   * Leave a community
   */
  leaveCommunity(communityId: string): Promise<void>;

  /**
   * Create new community
   */
  createCommunity(data: Omit<Community, 'id' | 'memberCount' | 'postCount' | 'createdAt' | 'updatedAt'>): Promise<Community>;

  // Posts management

  /**
   * Get posts from a community
   */
  getCommunityPosts(communityId: string, limit?: number, offset?: number): Promise<{
    posts: CommunityPost[];
    total: number;
    hasMore: boolean;
  }>;

  /**
   * Get post details by ID
   */
  getPostById(postId: string): Promise<CommunityPost>;

  /**
   * Create new post in community
   */
  createPost(data: {
    communityId: string;
    title: string;
    content: string;
    type: CommunityPost['type'];
    tags?: string[];
    relatedWordId?: string;
  }): Promise<CommunityPost>;

  /**
   * Update post (only by author or moderator)
   */
  updatePost(postId: string, data: Partial<Pick<CommunityPost, 'title' | 'content' | 'tags'>>): Promise<CommunityPost>;

  /**
   * Delete post (only by author or moderator)
   */
  deletePost(postId: string): Promise<void>;

  /**
   * Like/unlike post
   */
  togglePostLike(postId: string): Promise<{ isLiked: boolean; likesCount: number }>;

  /**
   * Pin/unpin post (moderator only)
   */
  togglePostPin(postId: string): Promise<{ isPinned: boolean }>;

  // Comments management

  /**
   * Get comments for a post
   */
  getPostComments(postId: string): Promise<PostComment[]>;

  /**
   * Add comment to post
   */
  addComment(data: {
    postId: string;
    content: string;
    parentId?: string;
  }): Promise<PostComment>;

  /**
   * Update comment (only by author)
   */
  updateComment(commentId: string, content: string): Promise<PostComment>;

  /**
   * Delete comment (only by author or moderator)
   */
  deleteComment(commentId: string): Promise<void>;

  /**
   * Like/unlike comment
   */
  toggleCommentLike(commentId: string): Promise<{ isLiked: boolean; likesCount: number }>;

  // Members management

  /**
   * Get community members
   */
  getCommunityMembers(communityId: string): Promise<CommunityMember[]>;

  /**
   * Get member details
   */
  getMemberById(communityId: string, userId: string): Promise<CommunityMember>;

  /**
   * Update member role (admin/moderator only)
   */
  updateMemberRole(communityId: string, userId: string, role: CommunityMember['role']): Promise<void>;

  /**
   * Remove member from community (admin/moderator only)
   */
  removeMember(communityId: string, userId: string): Promise<void>;

  // Activity and analytics

  /**
   * Get community activity feed
   */
  getCommunityActivity(communityId: string, limit?: number): Promise<CommunityActivity[]>;

  /**
   * Get community statistics
   */
  getCommunityStats(communityId: string): Promise<{
    memberCount: number;
    postCount: number;
    activeMembers: number;
    postsThisWeek: number;
    topContributors: CommunityMember[];
    popularPosts: CommunityPost[];
  }>;

  // Moderation (moderator/admin only)

  /**
   * Report post or comment
   */
  reportContent(data: {
    contentType: 'post' | 'comment';
    contentId: string;
    reason: string;
    description?: string;
  }): Promise<void>;

  /**
   * Get reported content (moderator only)
   */
  getReportedContent(communityId: string): Promise<{
    posts: (CommunityPost & { reportCount: number })[];
    comments: (PostComment & { reportCount: number })[];
  }>;

  /**
   * Moderate content (moderator only)
   */
  moderateContent(data: {
    contentType: 'post' | 'comment';
    contentId: string;
    action: 'approve' | 'remove' | 'hide';
    reason?: string;
  }): Promise<void>;

  /**
   * Update community settings (admin only)
   */
  updateCommunitySettings(communityId: string, settings: Partial<Community>): Promise<Community>;
}