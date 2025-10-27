package com.unimate.domain.match.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.unimate.domain.match.dto.MatchResultResponse;
import com.unimate.domain.match.dto.MatchStatusResponse;
import com.unimate.domain.match.entity.Match;
import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.user.user.entity.User;

/**
 * 매칭 관련 유틸리티 함수들을 담당하는 서비스
 */
@Service
public class MatchUtilityService {

    /**
     * 나이 계산
     */
    public Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) return null;

        LocalDate today = LocalDate.now();
        int age = today.getYear() - birthDate.getYear();

        // 생일이 아직 지나지 않았으면 1살 빼기
        if (today.getDayOfYear() < birthDate.getDayOfYear()) {
            age--;
        }

        return Math.max(0, age);
    }

    /**
     * 매칭 상태별 메시지 반환
     */
    public String getStatusMessage(MatchStatus status) {
        return switch (status) {
            case NONE -> "관계 없음";
            case PENDING -> "매칭 대기 중입니다.";
            case ACCEPTED -> "룸메이트 매칭이 성사되었습니다!";
            case REJECTED -> "매칭이 거절되었습니다.";
        };
    }

    /**
     * Match를 MatchStatusItem으로 변환
     */
    public MatchStatusResponse.MatchStatusItem toMatchStatusItem(Match match, Long currentUserId) {
        String message = getStatusMessage(match.getMatchStatus());
        
        // 현재 사용자 기준으로 상대방 정보 설정
        User partner = match.getSender().getId().equals(currentUserId) 
            ? match.getReceiver() 
            : match.getSender();

        // 현재 사용자와 상대방의 응답 상태 조회
        MatchStatus myResponse = match.getUserResponse(currentUserId);
        MatchStatus partnerResponse;
        
        if (match.getSender().getId().equals(currentUserId)) {
            partnerResponse = match.getReceiverResponse();
        } else {
            partnerResponse = match.getSenderResponse();
        }

        // 상대방의 응답 대기 중 여부 판단
        boolean waitingForPartner = (myResponse != MatchStatus.PENDING) 
                                    && (partnerResponse == MatchStatus.PENDING);

        return MatchStatusResponse.MatchStatusItem.builder()
                .id(match.getId())
                .senderId(match.getSender().getId())
                .receiverId(match.getReceiver().getId())
                .matchType(match.getMatchType())
                .matchStatus(match.getMatchStatus())
                .preferenceScore(match.getPreferenceScore())
                .createdAt(match.getCreatedAt())
                .confirmedAt(match.getConfirmedAt())
                .message(message)
                .myResponse(myResponse)
                .partnerResponse(partnerResponse)
                .waitingForPartner(waitingForPartner)
                .partner(MatchStatusResponse.MatchStatusItem.PartnerInfo.builder()
                        .id(partner.getId())
                        .name(partner.getName())
                        .email(partner.getEmail())
                        .university(partner.getUniversity())
                        .build())
                .build();
    }

    /**
     * Match를 MatchResultItem으로 변환
     */
    public MatchResultResponse.MatchResultItem toMatchResultItem(Match match, Long currentUserId) {
        // 현재 사용자 기준으로 상대방 정보 설정
        User partner = match.getSender().getId().equals(currentUserId) 
            ? match.getReceiver() 
            : match.getSender();
            
        return new MatchResultResponse.MatchResultItem(
                match.getId(),
                currentUserId,
                match.getSender().getId().equals(currentUserId) ? match.getSender().getName() : partner.getName(),
                partner.getId(),
                partner.getName(),
                match.getMatchType(),
                match.getMatchStatus(),
                match.getPreferenceScore(),
                match.getCreatedAt(),
                match.getUpdatedAt(),
                match.getConfirmedAt()
        );
    }
}
