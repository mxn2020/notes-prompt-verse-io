import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, Tag, FolderOpen, Plus, Settings, ChevronRight, ChevronDown, Notebook, PenTool } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);

  // This would come from API in a real app
  const categories = [
    { id: '1', name: 'Hackathon', color: 'primary-500' },
    { id: '2', name: 'Product Ideas', color: 'secondary-500' },
    { id: '3', name: 'Learning', color: 'accent-500' },
    { id: '4', name: 'Meetings', color: 'error-500' },
  ];

  // This would come from API in a real app
  const tags = [
    { id: '1', name: 'important', count: 4 },
    { id: '2', name: 'productivity', count: 6 },
    { id: '3', name: 'reference', count: 2 },
    { id: '4', name: 'ideas', count: 5 },
  ];

  const toggleCategories = () => {
    setCategoriesOpen(!categoriesOpen);
  };

  const toggleTags = () => {
    setTagsOpen(!tagsOpen);
  };

  const sidebarClasses = twMerge(
    'fixed h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20',
    isOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'
  );

  if (!isOpen) {
    return (
      <div className={sidebarClasses}>
        <div className="p-4 flex items-center justify-center h-16">
          <PenTool className="h-6 w-6 text-primary-600" />
        </div>
        <nav className="mt-2">
          <div className="px-2 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                twMerge(
                  'flex items-center justify-center p-2 rounded-md',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                )
              }
              title="Dashboard"
            >
              <Home className="h-6 w-6" />
            </NavLink>
            <NavLink
              to="/notes/new"
              className="flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-600"
              title="New Note"
            >
              <Plus className="h-6 w-6" />
            </NavLink>
            <NavLink
              to="/note-types"
              className={({ isActive }) =>
                twMerge(
                  'flex items-center justify-center p-2 rounded-md',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                )
              }
              title="Note Types"
            >
              <Notebook className="h-6 w-6" />
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                twMerge(
                  'flex items-center justify-center p-2 rounded-md',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                )
              }
              title="Settings"
            >
              <Settings className="h-6 w-6" />
            </NavLink>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className={sidebarClasses}>
      <div className="p-4 flex items-center h-16">
        <PenTool className="h-6 w-6 text-primary-600 mr-2" />
        <h1 className="text-xl font-semibold text-primary-600">PromptNotes</h1>
      </div>
      <nav className="mt-2 px-2">
        <div className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              twMerge(
                'flex items-center px-2 py-2 rounded-md font-medium',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              )
            }
          >
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </NavLink>
          <NavLink
            to="/notes/new"
            className="flex items-center px-2 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Note
          </NavLink>
          <NavLink
            to="/note-types"
            className={({ isActive }) =>
              twMerge(
                'flex items-center px-2 py-2 rounded-md font-medium',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              )
            }
          >
            <Notebook className="h-5 w-5 mr-2" />
            Note Types
          </NavLink>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={toggleCategories}
            className="flex items-center justify-between w-full px-2 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
          >
            <div className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              <span>Categories</span>
            </div>
            {categoriesOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {categoriesOpen && (
            <div className="ml-2 pl-2 border-l border-gray-200 mt-1 space-y-1">
              {categories.map((category) => (
                <NavLink
                  key={category.id}
                  to={`/?category=${category.id}`}
                  className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
                >
                  <div className={`w-2 h-2 rounded-full bg-${category.color} mr-2`} />
                  {category.name}
                </NavLink>
              ))}
              <NavLink
                to="/settings?tab=categories"
                className="flex items-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 rounded-md"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add category
              </NavLink>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={toggleTags}
            className="flex items-center justify-between w-full px-2 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
          >
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              <span>Tags</span>
            </div>
            {tagsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {tagsOpen && (
            <div className="ml-2 pl-2 border-l border-gray-200 mt-1 space-y-1">
              {tags.map((tag) => (
                <NavLink
                  key={tag.id}
                  to={`/?tag=${tag.name}`}
                  className="flex items-center justify-between px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
                >
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                    #{tag.name}
                  </span>
                  <span className="text-xs text-gray-500">{tag.count}</span>
                </NavLink>
              ))}
              <NavLink
                to="/settings?tab=tags"
                className="flex items-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 rounded-md"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add tag
              </NavLink>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              twMerge(
                'flex items-center px-2 py-2 rounded-md font-medium',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              )
            }
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;