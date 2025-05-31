import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Calendar, Clock, Edit } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">View and manage your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="sm:flex items-start">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 mb-4">
                <div className="flex items-center mr-4 mb-2 sm:mb-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Joined April 2025</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Last active today</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-2">Activity Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-primary-600 mb-1">12</div>
              <div className="text-sm text-gray-500">Notes Created</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-primary-600 mb-1">3</div>
              <div className="text-sm text-gray-500">Custom Note Types</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-primary-600 mb-1">8</div>
              <div className="text-sm text-gray-500">Days Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;