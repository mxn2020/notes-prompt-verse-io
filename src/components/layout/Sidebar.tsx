import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, Tag, FolderOpen, Plus, Settings, ChevronRight, ChevronDown, Notebook, PenTool } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { api } from '../../utils/api';
import { Note } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notes to extract categories and tags
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/notes');
        if (response.data.success) {
          setNotes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching notes for sidebar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Simple function to assign colors to categories
  const getCategoryColor = (category: string): string => {
    const colors = [
      'blue-500',
      'green-500', 
      'purple-500',
      'orange-500',
      'red-500',
      'teal-500',
      'pink-500',
      'indigo-500'
    ];
    
    const hash = category.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Extract unique categories from notes
  const categories = React.useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    notes.forEach((note) => {
      if (note.category) {
        const count = categoryMap.get(note.category) || 0;
        categoryMap.set(note.category, count + 1);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        count,
        color: getCategoryColor(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [notes]);

  // Extract unique tags from notes
  const tags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    
    notes.forEach((note) => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach((tag) => {
          const count = tagMap.get(tag) || 0;
          tagMap.set(tag, count + 1);
        });
      }
    });

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ id: name, name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count, most used first
  }, [notes]);

  const toggleCategories = () => {
    setCategoriesOpen(!categoriesOpen);
  };

  const toggleTags = () => {
    setTagsOpen(!tagsOpen);
  };

  const sidebarClasses = twMerge(
    'h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
    isOpen ? 'w-64' : 'w-0 md:w-16 overflow-hidden'
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
              {isLoading ? (
                <div className="px-2 py-1 text-sm text-gray-500">Loading...</div>
              ) : categories.length > 0 ? (
                <>
                  {categories.map((category) => (
                    <NavLink
                      key={category.id}
                      to={`/?category=${encodeURIComponent(category.name)}`}
                      className="flex items-center justify-between px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-${category.color} mr-2`} />
                        {category.name}
                      </div>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </NavLink>
                  ))}
                  <NavLink
                    to="/settings?tab=categories"
                    className="flex items-center px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-primary-600 rounded-md"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add category
                  </NavLink>
                </>
              ) : (
                <div className="px-2 py-1 text-sm text-gray-500">No categories yet</div>
              )}
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