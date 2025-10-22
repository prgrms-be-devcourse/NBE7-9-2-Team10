'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';
import { ProfileResponse } from '@/types/profile';
import { UserService } from '@/lib/services/UserService';
import { RegisterService } from '@/lib/services/registerService';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ProfileCardProps {
  user: User;
  profile: ProfileResponse;
  onEdit: () => void;
  onToggleMatching: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  profile, 
  onEdit, 
  onToggleMatching, 
  onUserUpdate 
}) => {
  // 이름 수정 상태
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState('');

  // 이메일 수정 상태
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const getGenderText = (gender: string) => {
    return gender === 'MALE' ? '남성' : '여성';
  };

  const getMatchingStatusText = (enabled: boolean) => {
    return enabled ? '매칭 활성화' : '매칭 비활성화';
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatFrequency = (frequency?: number) => {
    if (frequency === undefined || frequency === null) return '미설정';
    const frequencyMap: Record<number, string> = {
      1: '매우 낮음',
      2: '낮음',
      3: '보통',
      4: '높음',
      5: '매우 높음',
    };
    return frequencyMap[frequency] || '미설정';
  };

  const formatAgeGap = (ageGap?: number) => {
    if (ageGap === undefined || ageGap === null) return '미설정';
    const ageGapMap: Record<number, string> = {
      0: '상관없음',
      1: '1살 차이',
      2: '2살 차이',
      3: '3살 차이',
      5: '5살 차이',
      10: '10살 차이',
    };
    return ageGapMap[ageGap] || '미설정';
  };

  const formatBoolean = (value?: boolean) => {
    if (value === undefined || value === null) return '미설정';
    return value ? '예' : '아니오';
  };

  // 이름 수정 핸들러
  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      setNameError('이름을 입력해주세요.');
      return;
    }

    if (newName === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    setNameError('');

    try {
      const updatedUserInfo = await UserService.updateName(newName);
      
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          name: updatedUserInfo.name
        });
      }
      
      setIsEditingName(false);
    } catch (err: any) {
      setNameError(err.message || '이름 수정에 실패했습니다.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelNameEdit = () => {
    setNewName(user.name);
    setIsEditingName(false);
    setNameError('');
  };

  // 이메일 수정 핸들러
  const handleSendEmailCode = async () => {
    if (!newEmail || !newEmail.endsWith('.ac.kr')) {
      setEmailError('학교 이메일(.ac.kr)만 사용 가능합니다.');
      return;
    }

    if (newEmail === user.email) {
      setEmailError('현재 이메일과 동일합니다.');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError('');
    setEmailMessage('');

    try {
      await RegisterService.requestVerification(newEmail);
      setIsEmailCodeSent(true);
      setEmailMessage('인증번호가 이메일로 전송되었습니다.');
    } catch (err: any) {
      setEmailError(err.message || '인증번호 전송에 실패했습니다.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!emailCode) {
      setEmailError('인증번호를 입력해주세요.');
      return;
    }

    if (emailCode.length !== 6) {
      setEmailError('인증번호는 6자리여야 합니다.');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError('');

    try {
      await RegisterService.verifyEmailCode(newEmail, emailCode);
      setIsEmailVerified(true);
      setEmailMessage('이메일 인증이 완료되었습니다.');
    } catch (err: any) {
      setEmailError(err.message || '인증번호가 올바르지 않습니다.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!isEmailVerified) {
      setEmailError('이메일 인증을 완료해주세요.');
      return;
    }
  
    setIsUpdatingEmail(true);
    setEmailError('');
  
    try {
      const updatedUserInfo = await UserService.updateEmail(newEmail, emailCode);
      
      // 새 토큰 저장
      localStorage.setItem('accessToken', updatedUserInfo.accessToken);
      localStorage.setItem('userEmail', updatedUserInfo.email);
      
      // Context의 user 상태 업데이트
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          email: updatedUserInfo.email,
          name: updatedUserInfo.name,
          gender: updatedUserInfo.gender,
          birthDate: updatedUserInfo.birthDate,
          university: updatedUserInfo.university
        });
      }
      
      // 편집 모드 종료 및 상태 초기화
      setIsEditingEmail(false);
      setNewEmail('');
      setEmailCode('');
      setIsEmailCodeSent(false);
      setIsEmailVerified(false);
      setEmailError('');
      setEmailMessage('이메일이 성공적으로 변경되었습니다!');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setEmailMessage('');
      }, 3000);
      
    } catch (err: any) {
      setEmailError(err.message || '이메일 수정에 실패했습니다.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false);
    setNewEmail('');
    setEmailCode('');
    setIsEmailCodeSent(false);
    setIsEmailVerified(false);
    setEmailError('');
    setEmailMessage('');
  };

  const handleEmailCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setEmailCode(value);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 프로필 헤더 */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {user.name?.charAt(0) || '?'}
          </span>
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 이름 수정 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">이름</label>
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이름을 입력하세요"
                    disabled={isUpdatingName}
                  />
                  {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleNameUpdate}
                      disabled={isUpdatingName}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isUpdatingName ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={handleCancelNameEdit}
                      disabled={isUpdatingName}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:bg-gray-100"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{user.name}</p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">나이</label>
              <p className="text-gray-900">{calculateAge(user.birthDate)}세</p>
            </div>
          </div>

          {/* 이메일 수정 */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">이메일</label>
              {isEditingEmail ? (
                <div className="space-y-3">
                  {/* 새 이메일 입력 */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
                      placeholder="new.email@uni.ac.kr"
                      disabled={isEmailVerified}
                    />
                    <button
                      onClick={handleSendEmailCode}
                      disabled={isUpdatingEmail || isEmailVerified}
                      className={`px-4 py-2 rounded-md text-white text-sm whitespace-nowrap ${
                        isEmailVerified
                          ? 'bg-green-500 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isEmailVerified ? '인증 완료' : '인증번호 전송'}
                    </button>
                  </div>

                  {/* 인증번호 입력 */}
                  {isEmailCodeSent && !isEmailVerified && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={emailCode}
                        onChange={handleEmailCodeInput}
                        maxLength={6}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="인증번호 6자리"
                      />
                      <button
                        onClick={handleVerifyEmailCode}
                        disabled={isUpdatingEmail}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 whitespace-nowrap"
                      >
                        확인
                      </button>
                    </div>
                  )}

                  {/* 에러/성공 메시지 */}
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                  {emailMessage && <p className="text-blue-600 text-sm">{emailMessage}</p>}

                  {/* 저장/취소 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleEmailUpdate}
                      disabled={!isEmailVerified || isUpdatingEmail}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isUpdatingEmail ? '변경 중...' : '이메일 변경'}
                    </button>
                    <button
                      onClick={handleCancelEmailEdit}
                      disabled={isUpdatingEmail}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:bg-gray-100"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{user.email}</p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">대학교</label>
              <p className="text-gray-900">{user.university}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">성별</label>
              <p className="text-gray-900">{getGenderText(user.gender)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 생활 습관 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            생활 습관
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">평균 수면 시간</label>
              <p className="text-gray-900">{profile.sleepTime !== undefined ? `${profile.sleepTime}:00` : '미설정'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">청소 빈도</label>
              <p className="text-gray-900">{formatFrequency(profile.cleaningFrequency)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">위생 수준</label>
              <p className="text-gray-900">{formatFrequency(profile.hygieneLevel)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">음주 빈도</label>
              <p className="text-gray-900">{formatFrequency(profile.drinkingFrequency)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">손님 초대 빈도</label>
              <p className="text-gray-900">{formatFrequency(profile.guestFrequency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">소음 민감도</label>
              <p className="text-gray-900">{formatFrequency(profile.noiseSensitivity)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 성격 및 선호도 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            성격 및 선호도
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">MBTI</label>
              <p className="text-gray-900">{profile.mbti || '미설정'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">선호 연령대 차이</label>
              <p className="text-gray-900">{formatAgeGap(profile.preferredAgeGap)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 생활 스타일 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            생활 스타일
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">반려동물 허용</label>
              <p className="text-gray-900">{formatBoolean(profile.isPetAllowed)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">흡연자</label>
              <p className="text-gray-900">{formatBoolean(profile.isSmoker)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">코골이</label>
              <p className="text-gray-900">{formatBoolean(profile.isSnoring)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 매칭 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            매칭 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">사용 시작일</label>
              <p className="text-gray-900">{profile.startUseDate ? new Date(profile.startUseDate).toLocaleDateString('ko-KR') : '미설정'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">사용 종료일</label>
              <p className="text-gray-900">{profile.endUseDate ? new Date(profile.endUseDate).toLocaleDateString('ko-KR') : '미설정'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">매칭 상태</label>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.matchingEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getMatchingStatusText(profile.matchingEnabled || false)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={onEdit}
          variant="primary"
          className="flex-1 max-w-xs"
        >
          프로필 수정
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;