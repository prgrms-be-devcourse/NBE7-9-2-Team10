    private void sendWebSocketNotification(Notification notification) {
        try {
            System.out.println("=== WebSocket 알림 전송 시작 ===");
            System.out.println("notificationId: " + notification.getId());
            System.out.println("userId: " + notification.getUser().getId());
            System.out.println("type: " + notification.getType());
            System.out.println("message: " + notification.getMessage());
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", notification.getId());
            payload.put("type", notification.getType().toString());
            payload.put("message", notification.getMessage());
            payload.put("senderName", notification.getSenderName());
            payload.put("senderId", notification.getSenderId());
            payload.put("chatroomId", notification.getChatroomId());
            payload.put("isRead", notification.isRead());
            payload.put("createdAt", notification.getCreatedAt().toString());

            // WebSocket 전송 경로 수정
            String destination = "/user/" + notification.getUser().getId() + "/queue/notifications";
            System.out.println("WebSocket 전송 경로: " + destination);
            System.out.println("전송할 payload: " + payload);
            
            messagingTemplate.convertAndSend(destination, payload);
            System.out.println("WebSocket 알림 전송 완료 - userId: " + notification.getUser().getId());
            System.out.println("=== WebSocket 알림 전송 완료 ===");
        } catch (Exception e) {
            System.out.println("=== WebSocket 전송 실패 ===");
            System.out.println("에러: " + e.getMessage());
            e.printStackTrace();
        }
    }
