import { useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { notificationApi } from '../lib/api';
import { formatDateTime } from '../utils/formatting';

interface NotificationsPageProps {
  currentUser: User;
}

export default function NotificationsPage({ currentUser }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, [currentUser?.id]);

  const loadNotifications = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    
    // TODO: 백엔드 알림 API 구현 후 활성화
    // 임시로 빈 데이터 설정
    setNotifications([]);
    setLoading(false);
    
    // try {
    //   const response = await notificationApi.getNotifications(currentUser.id);
    //   if (response.ok) {
    //     setNotifications(response.data || []);
    //   }
    // } catch (error) {
    //   // 백엔드 API가 구현되지 않은 경우 조용히 무시
    //   console.log('Notification API not implemented yet:', error);
    //   setNotifications([]);
    // } finally {
    //   setLoading(false);
    // }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser?.id) return;
    
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return (
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'vote':
        return (
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'discussion':
        return (
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'verification':
        return (
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'proposal':
        return '제안서';
      case 'vote':
        return '투표';
      case 'discussion':
        return '토론';
      case 'verification':
        return '인증';
      case 'system':
        return '시스템';
      default:
        return '알림';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">알림</h1>
        
        {/* 필터 및 액션 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'unread'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              읽지 않음 ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'read'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              읽음 ({notifications.length - unreadCount})
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
            >
              모두 읽음으로 표시
            </button>
          )}
        </div>
      </div>

      {/* 알림 목록 */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7H4.828zM4.828 17l2.586-2.586a2 2 0 012.828 0L12 17H4.828z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'all' ? '알림이 없습니다' : 
             filter === 'unread' ? '읽지 않은 알림이 없습니다' : '읽은 알림이 없습니다'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            새로운 알림이 오면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'ring-2 ring-blue-100' : ''
              }`}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification.id || '');
                }
                if (notification.actionUrl) {
                  window.location.href = notification.actionUrl;
                }
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          새 알림
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {notification.timestamp && formatDateTime(notification.timestamp)}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-medium mb-2 ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {notification.actionUrl && (
                    <div className="mt-3">
                      <span className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700">
                        자세히 보기
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}