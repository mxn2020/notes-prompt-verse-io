import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings as SettingsIcon, Tag, FolderOpen, Layout, Bell, Shield, Moon } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      addToast({
        type: 'error',
        message: 'Failed to log out. Please try again.',
      });
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="h-5 w-5" /> },
    { id: 'account', name: 'Account', icon: <Shield className="h-5 w-5" /> },
    { id: 'appearance', name: 'Appearance', icon: <Layout className="h-5 w-5" /> },
    { id: 'categories', name: 'Categories', icon: <FolderOpen className="h-5 w-5" /> },
    { id: 'tags', name: 'Tags', icon: <Tag className="h-5 w-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="sm:flex">
          {/* Tab navigation */}
          <div className="sm:w-64 border-r border-neutral-200">
            <nav className="p-4 sm:p-0">
              <div className="flex sm:flex-col space-x-2 sm:space-x-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md sm:rounded-none sm:border-l-4 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 sm:border-primary-600 sm:bg-transparent'
                        : 'text-neutral-600 hover:bg-neutral-50 sm:border-transparent'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Tab content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-6">Profile Settings</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    defaultValue={user?.name || ''}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input"
                    defaultValue={user?.email || ''}
                    disabled
                  />
                  <p className="mt-1 text-sm text-neutral-500">
                    Email address cannot be changed
                  </p>
                </div>
                
                <Button>Save Changes</Button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-6">Appearance Settings</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Theme
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center">
                      <input
                        id="theme-light"
                        name="theme"
                        type="radio"
                        className="radio"
                        defaultChecked
                      />
                      <label htmlFor="theme-light" className="ml-2 text-sm text-neutral-700">
                        Light
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="theme-dark"
                        name="theme"
                        type="radio"
                        className="radio"
                      />
                      <label htmlFor="theme-dark" className="ml-2 text-sm text-neutral-700">
                        Dark
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="theme-system"
                        name="theme"
                        type="radio"
                        className="radio"
                      />
                      <label htmlFor="theme-system" className="ml-2 text-sm text-neutral-700">
                        System
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Default Note Type
                  </label>
                  <select className="select">
                    <option value="basic-note">Basic Note</option>
                    <option value="daily-progress">Daily Progress</option>
                    <option value="meeting-notes">Meeting Notes</option>
                    <option value="bug-report">Bug Report</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Sidebar Settings
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center mb-2">
                      <input
                        id="sidebar-collapsed"
                        name="sidebar-collapsed"
                        type="checkbox"
                        className="checkbox"
                      />
                      <label htmlFor="sidebar-collapsed" className="ml-2 text-sm text-neutral-700">
                        Start with sidebar collapsed
                      </label>
                    </div>
                  </div>
                </div>
                
                <Button>Save Changes</Button>
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-6">Account Settings</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Change Password</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="input"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="input"
                    />
                  </div>
                  
                  <Button>Update Password</Button>
                </div>
                
                <hr className="my-8 border-neutral-200" />
                
                <div>
                  <h3 className="text-lg font-medium text-error-700 mb-2">Danger Zone</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button variant="danger" onClick={handleLogout}>
                      Sign Out
                    </Button>
                    <Button variant="danger">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-6">Categories</h2>
                
                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-primary-500 mr-3"></div>
                      <span>Hackathon</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-neutral-400 hover:text-neutral-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-neutral-400 hover:text-neutral-700">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-secondary-500 mr-3"></div>
                      <span>Product Ideas</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-neutral-400 hover:text-neutral-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-neutral-400 hover:text-neutral-700">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-md">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-accent-500 mr-3"></div>
                      <span>Learning</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-neutral-400 hover:text-neutral-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-neutral-400 hover:text-neutral-700">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      New Category
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Category name"
                        className="input"
                      />
                      <Button>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tags' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-6">Tags</h2>
                
                <div className="mb-6 flex flex-wrap gap-2">
                  <div className="flex items-center bg-primary-50 px-3 py-2 rounded-full">
                    <span className="text-primary-700 mr-2">#important</span>
                    <button className="text-primary-400 hover:text-primary-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center bg-primary-50 px-3 py-2 rounded-full">
                    <span className="text-primary-700 mr-2">#productivity</span>
                    <button className="text-primary-400 hover:text-primary-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center bg-primary-50 px-3 py-2 rounded-full">
                    <span className="text-primary-700 mr-2">#reference</span>
                    <button className="text-primary-400 hover:text-primary-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center bg-primary-50 px-3 py-2 rounded-full">
                    <span className="text-primary-700 mr-2">#ideas</span>
                    <button className="text-primary-400 hover:text-primary-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      New Tag
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Tag name (without #)"
                        className="input"
                      />
                      <Button>Add</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;