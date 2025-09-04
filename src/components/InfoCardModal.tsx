import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { InfoCard } from '../types';
import { infoCardApi } from '../lib/api';

interface InfoCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  card: InfoCard | null;
}

export default function InfoCardModal({ isOpen, onClose, onSave, card }: InfoCardModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<InfoCard>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (card) {
      setValue('title', card.title);
      setValue('summary', card.summary);
      setValue('linkUrl', card.linkUrl);
      setValue('category', card.category);
    } else {
      reset();
    }
  }, [card, setValue, reset]);

  const onSubmit = async (data: InfoCard) => {
    setIsSubmitting(true);
    try {
      if (card && card.id) {
        await infoCardApi.updateCard(card.id, data);
        toast.success('카드가 성공적으로 수정되었습니다.');
      } else {
        await infoCardApi.createCard(data);
        toast.success('새 카드가 생성되었습니다.');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{card ? '카드 수정' : '새 카드 생성'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">제목</label>
              <input {...register('title', { required: true })} className="w-full p-2 border rounded" />
              {errors.title && <span className="text-red-500 text-xs">제목을 입력해주세요.</span>}
            </div>
            <div>
              <label className="block text-sm font-medium">요약</label>
              <textarea {...register('summary', { required: true })} className="w-full p-2 border rounded" />
              {errors.summary && <span className="text-red-500 text-xs">요약을 입력해주세요.</span>}
            </div>
            <div>
              <label className="block text-sm font-medium">링크 URL</label>
              <input {...register('linkUrl', { required: true })} className="w-full p-2 border rounded" />
              {errors.linkUrl && <span className="text-red-500 text-xs">URL을 입력해주세요.</span>}
            </div>
            <div>
              <label className="block text-sm font-medium">카테고리</label>
              <select {...register('category', { required: true })} className="w-full p-2 border rounded">
                <option value="POLICY">정책</option>
                <option value="LAW">법률</option>
                <option value="NEWS">뉴스</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">취소</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">{isSubmitting ? '저장 중...' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
