'use client';

import { useState, FC } from 'react';
import { MatchService } from '@/lib/services/matchService';
import { getErrorMessage } from '@/lib/utils/helpers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// TODO: 백엔드의 MatchRecommendation DTO에 맞춰 타입 정의 필요
interface UserCardProps {
  user: any; 
  onLikeChange: (userId: number, isLiked: boolean) => void;
}

const UserCard: FC<UserCardProps> = ({ user, onLikeChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLikeClick = async () => {
    setIsLoading(true);
    try {
      if (user.isLiked) {
        await MatchService.cancelLike(user.receiverId);
        onLikeChange(user.receiverId, false);
        alert('좋아요를 취소했습니다.'); // TODO: Toast 컴포넌트로 교체
      } else {
        await MatchService.sendLike(user.receiverId);
        onLikeChange(user.receiverId, true);
        alert('좋아요를 보냈습니다.'); // TODO: Toast 컴포넌트로 교체
      }
    } catch (error) {
      alert(`오류: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{user.name} <span className="text-lg font-normal text-gray-500">{user.age}</span></CardTitle>
            <CardDescription>{user.university} · {user.major}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{user.matchRate}%</p>
            <p className="text-sm text-gray-500">매칭률</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {user.tags?.map((tag: string) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{tag}</span>
          ))}
        </div>
        <p className="text-gray-700 text-sm">{user.introduction}</p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleLikeClick}
          loading={isLoading}
          disabled={isLoading}
          variant={user.isLiked ? 'destructive' : 'outline'}
          className="w-full"
        >
          <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {user.isLiked ? '좋아요 취소' : '좋아요'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
