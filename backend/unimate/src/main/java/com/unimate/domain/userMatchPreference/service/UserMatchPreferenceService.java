package com.unimate.domain.userMatchPreference.service;

import com.unimate.domain.user.user.entity.User;
import com.unimate.domain.user.user.repository.UserRepository;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceRequest;
import com.unimate.domain.userMatchPreference.dto.MatchPreferenceResponse;
import com.unimate.domain.userMatchPreference.entity.UserMatchPreference;
import com.unimate.domain.userMatchPreference.repository.UserMatchPreferenceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserMatchPreferenceService {

    private final UserMatchPreferenceRepository userMatchPreferenceRepository;
    private final UserRepository userRepository;

    @Transactional
    public MatchPreferenceResponse updateMyMatchPreferences(Long userId, MatchPreferenceRequest requestDto) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

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

        // 더티 체킹 이용한 정보 업데이트
        preference.update(requestDto);

        UserMatchPreference  updatedPreference = userMatchPreferenceRepository.saveAndFlush(preference);

        // responseDto로 변환하여 반환
        return MatchPreferenceResponse.fromEntity(updatedPreference);
    }
}
