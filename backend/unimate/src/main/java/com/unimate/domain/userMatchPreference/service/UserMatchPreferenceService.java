package com.unimate.domain.userMatchPreference.service;

import com.unimate.domain.match.entity.MatchStatus;
import com.unimate.domain.match.entity.MatchType;
import com.unimate.domain.match.repository.MatchRepository;
import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceRequest;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceResponse;
import com.unimate.domain.userMatchPreference.entity.UserMatchPreference;
import com.unimate.domain.userMatchPreference.repository.UserMatchPreferenceRepository;
import com.unimate.domain.userProfile.entity.UserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import com.unimate.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserMatchPreferenceService {

    private final UserMatchPreferenceRepository userMatchPreferenceRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public MatchPreferenceResponse updateMyMatchPreferences(Long userId, MatchPreferenceRequest requestDto) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ServiceException.notFound("사용자를 찾을 수 없습니다."));

        // 기존 선호도 정보 조회(없으면 새로 생성)
        UserMatchPreference preference = userMatchPreferenceRepository.findByUserId(userId)
                .map(existingPref -> { // 기존 정보가 있으면 업데이트만 수행
                    existingPref.update(requestDto);
                    return existingPref;
                })
                .orElseGet(() -> {
                    UserMatchPreference newPref = UserMatchPreference.fromDto(user, requestDto);
                    return userMatchPreferenceRepository.save(newPref);
                });

        /* matchingEnabled 필드 true로 켜는 메서드가 들어갈 자리 */
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> ServiceException.notFound("해당 사용자의 프로필을 찾을 수 없습니다."));

        userProfile.updateMatchingStatus(true);


        // upodatedAt 동기화
        UserMatchPreference  updatedPreference = userMatchPreferenceRepository.saveAndFlush(preference);

        // responseDto로 변환하여 반환
        return MatchPreferenceResponse.fromEntity(updatedPreference);
    }
}
