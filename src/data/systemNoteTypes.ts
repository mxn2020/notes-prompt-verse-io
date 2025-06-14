import { NoteType } from '../types';

// Define system note types that will be available to all users
export const systemNoteTypes: Omit<NoteType, 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'daily-progress',
    name: 'Daily Progress',
    description: 'Track your daily hackathon progress with mood and energy levels',
    icon: 'calendar-check',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Title',
        type: 'text',
        placeholder: 'What did you accomplish today?',
        required: true,
        defaultValue: `Progress for ${new Date().toLocaleDateString()}`,
      },
      {
        id: 'content',
        name: 'content',
        label: 'Details',
        type: 'textarea',
        placeholder: 'Describe what you accomplished today...',
        required: true,
      },
      {
        id: 'mood',
        name: 'mood',
        label: 'Mood',
        type: 'select',
        options: ['Excited', 'Productive', 'gray', 'Frustrated', 'Exhausted'],
        defaultValue: 'Productive',
      },
      {
        id: 'energy',
        name: 'energy',
        label: 'Energy Level',
        type: 'select',
        options: ['High', 'Medium', 'Low'],
        defaultValue: 'Medium',
      },
      {
        id: 'challenges',
        name: 'challenges',
        label: 'Challenges Faced',
        type: 'textarea',
        placeholder: 'What challenges did you encounter?',
      },
      {
        id: 'wins',
        name: 'wins',
        label: 'Wins',
        type: 'textarea',
        placeholder: 'What went well today?',
      },
      {
        id: 'tomorrow',
        name: 'tomorrow',
        label: 'Tomorrow\'s Goals',
        type: 'textarea',
        placeholder: 'What do you plan to work on tomorrow?',
      },
    ],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Document meetings with attendees, action items, and follow-ups',
    icon: 'users',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Meeting Title',
        type: 'text',
        placeholder: 'What was the meeting about?',
        required: true,
      },
      {
        id: 'date',
        name: 'date',
        label: 'Date',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: 'attendees',
        name: 'attendees',
        label: 'Attendees',
        type: 'textarea',
        placeholder: 'Who attended the meeting?',
      },
      {
        id: 'agenda',
        name: 'agenda',
        label: 'Agenda',
        type: 'textarea',
        placeholder: 'What was discussed?',
      },
      {
        id: 'content',
        name: 'content',
        label: 'Discussion Notes',
        type: 'textarea',
        placeholder: 'Details of what was discussed...',
        required: true,
      },
      {
        id: 'action_items',
        name: 'action_items',
        label: 'Action Items',
        type: 'textarea',
        placeholder: 'What needs to be done after this meeting?',
      },
      {
        id: 'follow_up',
        name: 'follow_up',
        label: 'Follow-up Date',
        type: 'date',
      },
    ],
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Document bugs with severity, reproduction steps, and solutions',
    icon: 'bug',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Bug Title',
        type: 'text',
        placeholder: 'Brief description of the bug',
        required: true,
      },
      {
        id: 'severity',
        name: 'severity',
        label: 'Severity',
        type: 'select',
        options: ['Critical', 'High', 'Medium', 'Low', 'Cosmetic'],
        defaultValue: 'Medium',
      },
      {
        id: 'content',
        name: 'content',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Detailed description of the bug...',
        required: true,
      },
      {
        id: 'steps',
        name: 'steps',
        label: 'Steps to Reproduce',
        type: 'textarea',
        placeholder: 'How can someone else reproduce this bug?',
      },
      {
        id: 'expected',
        name: 'expected',
        label: 'Expected Behavior',
        type: 'textarea',
        placeholder: 'What should happen instead?',
      },
      {
        id: 'actual',
        name: 'actual',
        label: 'Actual Behavior',
        type: 'textarea',
        placeholder: 'What actually happens?',
      },
      {
        id: 'solution',
        name: 'solution',
        label: 'Solution/Fix',
        type: 'textarea',
        placeholder: 'How was the bug fixed?',
      },
    ],
  },
  {
    id: 'feature-idea',
    name: 'Feature Idea',
    description: 'Document feature ideas with priority and implementation notes',
    icon: 'lightbulb',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Feature Title',
        type: 'text',
        placeholder: 'Name of the feature',
        required: true,
      },
      {
        id: 'content',
        name: 'content',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Detailed description of the feature...',
        required: true,
      },
      {
        id: 'priority',
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['Must Have', 'Should Have', 'Nice to Have', 'Future Consideration'],
        defaultValue: 'Should Have',
      },
      {
        id: 'impact',
        name: 'impact',
        label: 'Impact',
        type: 'textarea',
        placeholder: 'How will this feature benefit users?',
      },
      {
        id: 'implementation',
        name: 'implementation',
        label: 'Implementation Notes',
        type: 'textarea',
        placeholder: 'Technical details on how to implement this feature',
      },
      {
        id: 'alternatives',
        name: 'alternatives',
        label: 'Alternatives Considered',
        type: 'textarea',
        placeholder: 'Other approaches that were considered',
      },
    ],
  },
  {
    id: 'learning-log',
    name: 'Learning Log',
    description: 'Track what you learn with key takeaways and resources',
    icon: 'book-open',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Topic',
        type: 'text',
        placeholder: 'What did you learn about?',
        required: true,
      },
      {
        id: 'content',
        name: 'content',
        label: 'Description',
        type: 'textarea',
        placeholder: 'What did you learn?',
        required: true,
      },
      {
        id: 'key_takeaways',
        name: 'key_takeaways',
        label: 'Key Takeaways',
        type: 'textarea',
        placeholder: 'What are the most important things you learned?',
      },
      {
        id: 'resources',
        name: 'resources',
        label: 'Resources',
        type: 'textarea',
        placeholder: 'What resources did you use? (URLs, books, etc.)',
      },
      {
        id: 'next_steps',
        name: 'next_steps',
        label: 'Next Steps',
        type: 'textarea',
        placeholder: 'What do you want to learn next?',
      },
    ],
  },
  {
    id: 'code-snippet',
    name: 'Code Snippet',
    description: 'Save code snippets with language, description, and tags',
    icon: 'code',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Title',
        type: 'text',
        placeholder: 'Title for this code snippet',
        required: true,
      },
      {
        id: 'language',
        name: 'language',
        label: 'Language',
        type: 'select',
        options: [
          'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Python', 
          'Java', 'C#', 'C++', 'Ruby', 'PHP', 'Go', 'Rust', 
          'Swift', 'Kotlin', 'SQL', 'Shell', 'Other'
        ],
        defaultValue: 'JavaScript',
      },
      {
        id: 'content',
        name: 'content',
        label: 'Code',
        type: 'textarea',
        placeholder: 'Paste your code here...',
        required: true,
      },
      {
        id: 'description',
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'What does this code do?',
      },
      {
        id: 'usage_example',
        name: 'usage_example',
        label: 'Usage Example',
        type: 'textarea',
        placeholder: 'How can this code be used?',
      },
    ],
  },
  {
    id: 'task-planning',
    name: 'Task Planning',
    description: 'Plan tasks with deadlines, assignees, and status tracking',
    icon: 'check-square',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Task Name',
        type: 'text',
        placeholder: 'Name of the task',
        required: true,
      },
      {
        id: 'content',
        name: 'content',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Details about the task...',
        required: true,
      },
      {
        id: 'status',
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['Not Started', 'In Progress', 'Blocked', 'Completed'],
        defaultValue: 'Not Started',
      },
      {
        id: 'priority',
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: ['High', 'Medium', 'Low'],
        defaultValue: 'Medium',
      },
      {
        id: 'deadline',
        name: 'deadline',
        label: 'Deadline',
        type: 'date',
      },
      {
        id: 'assignee',
        name: 'assignee',
        label: 'Assignee',
        type: 'text',
        placeholder: 'Who is responsible for this task?',
      },
      {
        id: 'subtasks',
        name: 'subtasks',
        label: 'Subtasks',
        type: 'textarea',
        placeholder: 'List any subtasks here...',
      },
    ],
  },
  {
    id: 'reflection',
    name: 'Reflection',
    description: 'Reflect on your progress and learning with guided prompts',
    icon: 'brain',
    isSystem: true,
    fields: [
      {
        id: 'title',
        name: 'title',
        label: 'Reflection Title',
        type: 'text',
        placeholder: 'What are you reflecting on?',
        required: true,
      },
      {
        id: 'content',
        name: 'content',
        label: 'Overall Reflection',
        type: 'textarea',
        placeholder: 'Your thoughts and reflections...',
        required: true,
      },
      {
        id: 'what_went_well',
        name: 'what_went_well',
        label: 'What went well?',
        type: 'textarea',
        placeholder: 'What aspects were successful?',
      },
      {
        id: 'what_could_improve',
        name: 'what_could_improve',
        label: 'What could be improved?',
        type: 'textarea',
        placeholder: 'What would you do differently next time?',
      },
      {
        id: 'insights',
        name: 'insights',
        label: 'Key Insights',
        type: 'textarea',
        placeholder: 'What did you learn from this experience?',
      },
      {
        id: 'next_actions',
        name: 'next_actions',
        label: 'Next Actions',
        type: 'textarea',
        placeholder: 'What will you do next based on these reflections?',
      },
    ],
  },
];

// Basic note type - the simplest form
export const basicNoteType: Omit<NoteType, 'userId' | 'createdAt' | 'updatedAt'> = {
  id: 'basic-note',
  name: 'Basic Note',
  description: 'A simple note with just content',
  icon: 'file-text',
  isSystem: true,
  fields: [
    {
      id: 'content',
      name: 'content',
      label: 'Content',
      type: 'textarea',
      placeholder: 'Write your note here...',
      required: true,
    },
  ],
};