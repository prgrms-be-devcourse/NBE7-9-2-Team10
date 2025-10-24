package com.unimate.domain.match.service;

import com.unimate.domain.match.dto.CachedUserProfile;
import com.unimate.domain.userProfile.repository.UserProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
public class MatchCacheService {

    private final UserProfileRepository userProfileRepository;
    
    @Value("${cache.redis.enabled:true}")
    private boolean redisCacheEnabled;
    
    @Autowired
    @Lazy
    private MatchCacheService self;

    public MatchCacheService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    // 애플리케이션 시작 시 캐시 예열
    @EventListener(ApplicationReadyEvent.class)
    public void warmupCache() {
        try {
            self.evictAllCandidatesCache();
            log.info("🧹 기존 캐시 삭제 완료");
            
            log.info("🔥 캐시 예열 시작");
            long startTime = System.currentTimeMillis();
            List<CachedUserProfile> candidates = self.getAllCandidates();
            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ 캐시 예열 완료 - {}명 로드 ({}ms 소요)", candidates.size(), duration);
        } catch (Exception e) {
            log.warn("⚠️ 캐시 예열 실패: {}", e.getMessage());
        }
    }

    // 전체 후보 목록 조회 (10분 캐시)
    @Cacheable(value = "matchCandidatesV2", key = "'all'")
    public List<CachedUserProfile> getAllCandidates() {
        log.info("🔴 Cache Miss - DB에서 전체 프로필 조회");
        
        return userProfileRepository.findAll()
                .stream()
                .map(CachedUserProfile::from)
                .toList();
    }

    // 개별 프로필 조회 (1시간 캐시)
    @Cacheable(value = "userProfile", key = "#userId")
    public CachedUserProfile getUserProfileById(Long userId) {
        log.info("🔴 Cache Miss - DB에서 개별 프로필 조회 (userId: {})", userId);
        
        return userProfileRepository.findByUserId(userId)
                .map(CachedUserProfile::from)
                .orElse(null);
    }

    // 전체 캐시 무효화
    @CacheEvict(value = "matchCandidatesV2", allEntries = true)
    public void evictAllCandidatesCache() {
        log.info("🧹 전체 매칭 후보 캐시 삭제");
    }

    // 특정 유저 캐시 무효화
    @CacheEvict(value = {"userProfile", "matchCandidatesV2"}, 
                key = "#userId", 
                allEntries = false,
                beforeInvocation = false)
    public void evictUserProfileCache(Long userId) {
        if (!redisCacheEnabled) {
            log.debug("⚪ Redis 비활성화 - 캐시 무효화 스킵");
            return;
        }
        log.info("🧹 유저 프로필 캐시 삭제 (userId: {})", userId);
        evictAllCandidatesCache();
    }

    // 여러 유저 캐시 일괄 무효화
    public void evictMultipleUserProfiles(List<Long> userIds) {
        if (!redisCacheEnabled) {
            log.debug("⚪ Redis 비활성화 - 다중 캐시 무효화 스킵");
            return;
        }
        log.info("🧹 다중 유저 프로필 캐시 삭제 ({} 명)", userIds.size());
        userIds.forEach(this::evictUserProfileCache);
    }
}

