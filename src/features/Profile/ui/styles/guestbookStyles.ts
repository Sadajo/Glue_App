import {StyleSheet} from 'react-native';

export const guestbookStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 40,
  },

  // 댓글 목록
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  myCommentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#F9FAFB',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  editedText: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 48,
  },

  // 비밀 댓글
  secretCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  secretCommentText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  secretCommentTitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  secretCommentDate: {
    fontSize: 12,
    color: '#999999',
  },

  // 메뉴 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 120,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  deleteText: {
    color: '#FF3B30',
  },
  reportText: {
    color: '#FF9500',
  },

  // 입력 영역
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputHeader: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secretButtonInInput: {
    padding: 4,
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 0,
    maxHeight: 80,
  },
  submitButton: {
    backgroundColor: '#1CBFDC',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  submitButtonActive: {
    backgroundColor: '#1CBFDC',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButtonTextActive: {
    color: '#FFFFFF',
  },
  cancelEditButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cancelEditText: {
    fontSize: 14,
    color: '#007AFF',
  },

  // 답글 버튼
  replyButton: {
    marginLeft: 48,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },

  // 로딩 및 끝 표시
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  endContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endText: {
    fontSize: 14,
    color: '#999999',
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
});
