import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Tag, FolderOpen, Layout, Bell, Shield, Edit, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs defaultValue="profile" className="w-full">
          <div className="flex">
            {/* Tab navigation */}
            <div className="w-64 border-r border-gray-200">
              <TabsList className="flex flex-col h-auto w-full justify-start space-y-1 bg-transparent p-4">
                <TabsTrigger value="profile" className="w-full justify-start">
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="account" className="w-full justify-start">
                  <Shield className="h-5 w-5 mr-3" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="appearance" className="w-full justify-start">
                  <Layout className="h-5 w-5 mr-3" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="categories" className="w-full justify-start">
                  <FolderOpen className="h-5 w-5 mr-3" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="tags" className="w-full justify-start">
                  <Tag className="h-5 w-5 mr-3" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="notifications" className="w-full justify-start">
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-6">
              <TabsContent value="profile" className="mt-0">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Profile Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        defaultValue={user?.name || ''}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="mt-1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Email address cannot be changed
                      </p>
                    </div>
                    
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Appearance Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label>Theme</Label>
                      <div className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            id="theme-light"
                            name="theme"
                            type="radio"
                            defaultChecked
                            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          />
                          <Label htmlFor="theme-light" className="text-sm">
                            Light
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            id="theme-dark"
                            name="theme"
                            type="radio"
                            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          />
                          <Label htmlFor="theme-dark" className="text-sm">
                            Dark
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            id="theme-system"
                            name="theme"
                            type="radio"
                            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          />
                          <Label htmlFor="theme-system" className="text-sm">
                            System
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="note-type">Default Note Type</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select default note type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic-note">Basic Note</SelectItem>
                          <SelectItem value="daily-progress">Daily Progress</SelectItem>
                          <SelectItem value="meeting-notes">Meeting Notes</SelectItem>
                          <SelectItem value="bug-report">Bug Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Sidebar Settings</Label>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="sidebar-collapsed" />
                          <Label htmlFor="sidebar-collapsed" className="text-sm">
                            Start with sidebar collapsed
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            className="mt-1"
                          />
                        </div>
                        
                        <Button>Update Password</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      
                      <div className="flex space-x-4">
                        <Button variant="destructive" onClick={handleLogout}>
                          Sign Out
                        </Button>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="mt-0">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Categories</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-primary mr-3"></div>
                          <span>Hackathon</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-secondary mr-3"></div>
                          <span>Product Ideas</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-accent mr-3"></div>
                          <span>Learning</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-category">New Category</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="new-category"
                          type="text"
                          placeholder="Category name"
                          className="flex-1"
                        />
                        <Button>Add</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tags" className="mt-0">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Tags</h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center">
                        #important
                        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                      
                      <Badge variant="secondary" className="flex items-center">
                        #productivity
                        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                      
                      <Badge variant="secondary" className="flex items-center">
                        #reference
                        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                      
                      <Badge variant="secondary" className="flex items-center">
                        #ideas
                        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-tag">New Tag</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="new-tag"
                          type="text"
                          placeholder="Tag name (without #)"
                          className="flex-1"
                        />
                        <Button>Add</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Notifications</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Checkbox />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                        </div>
                        <Checkbox />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Daily Digest</Label>
                          <p className="text-sm text-gray-500">Receive a daily summary of your notes</p>
                        </div>
                        <Checkbox />
                      </div>
                    </div>
                    
                    <Button>Save Preferences</Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;