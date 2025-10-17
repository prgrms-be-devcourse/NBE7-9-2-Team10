// scripts/stomp-test.mjs
import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';

// 사용법: node scripts/stomp-test.mjs <ACCESS_TOKEN> <CHATROOM_ID> "<메시지(옵션)>"
const [,, TOKEN, CHATROOM_ID_RAW, MSG = 'hello via WS'] = process.argv;
const CHATROOM_ID = Number(CHATROOM_ID_RAW);

if (!TOKEN || !CHATROOM_ID) {
    console.error('Usage: node scripts/stomp-test.mjs <ACCESS_TOKEN> <CHATROOM_ID> "<MESSAGE optional>"');
    process.exit(1);
}

const WS_URL   = 'ws://localhost:8080/ws-stomp';
const SUB_DEST = `/sub/chatroom.${CHATROOM_ID}`; // 서버 broadcast
const ACK_DEST = '/user/queue/chat.ack';         // 서버 ACK
const PUB_DEST = '/pub/chat.send';

const client = new Client({
    webSocketFactory: () => new WebSocket(WS_URL, ['v12.stomp']),
    debug: (s) => console.log('[STOMP]', s),
    connectHeaders: {
        Authorization: `Bearer ${TOKEN}`, // STOMP 헤더로 JWT 전달 → 인터셉터가 검증
        'accept-version': '1.2',
        host: 'localhost',
    },
    reconnectDelay: 0,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
});

client.onConnect = async () => {
    console.log('✅ CONNECTED');

    // 1) 채팅방 푸시 구독
    client.subscribe(SUB_DEST, (msg) => {
        console.log('📩 PUSH:', msg.body);
    });

    // 2) 나에게만 오는 ACK 구독
    client.subscribe(ACK_DEST, (msg) => {
        console.log('✅ ACK :', msg.body);
    });

    // 3) 전송
    const payload = {
        chatroomId: CHATROOM_ID,
        content: MSG,
        clientMessageId: `cli-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // 멱등키
    };
    client.publish({ destination: PUB_DEST, body: JSON.stringify(payload) });
    console.log('➡️  SENT:', JSON.stringify(payload));

    // 4) 충분히 기다렸다가 종료(5초)
    setTimeout(async () => {
        await client.deactivate();
        console.log('👋 Bye');
        process.exit(0);
    }, 5000);
};

client.onStompError = (frame) => {
    console.error('STOMP ERROR', frame.headers, frame.body);
};

client.onWebSocketError = (err) => {
    console.error('WS ERROR', err);
};

client.activate();
