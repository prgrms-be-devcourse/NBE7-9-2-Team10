// MatchService.java에서 매칭 알림 생성 부분 수정

// 기존 코드:
// notificationService.createNotification(
//         receiverId,
//         NotificationType.MATCH,
//         sender.getName() + " 님과 매칭되었습니다!",
//         sender.getName(),
//         senderId
// );

// 수정된 코드:
// 상호 좋아요 성사 시 채팅방 자동 생성
Long chatroomId = null;
try {
    chatroomId = chatroomService.createIfNotExists(senderId, receiverId);
} catch (Exception e) {
    // 채팅방 생성 실패해도 매칭은 진행
}

// 상호 좋아요 성사 알림 (매칭 알림) - chatroomId 포함
try {
    notificationService.createChatNotification(
            receiverId,
            NotificationType.MATCH,
            sender.getName() + " 님과 매칭되었습니다!",
            sender.getName(),
            senderId,
            chatroomId
    );
} catch (Exception e) {
    // 알림 생성 실패해도 매칭은 진행
}
