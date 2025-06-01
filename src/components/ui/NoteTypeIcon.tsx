import React from 'react';
import { 
  FileText, 
  CalendarCheck, 
  Users, 
  Bug, 
  Lightbulb, 
  BookOpen, 
  Target, 
  MessageSquare, 
  Presentation, 
  Briefcase, 
  ShoppingCart, 
  Map, 
  Palette,
  LucideIcon
} from 'lucide-react';

interface NoteTypeIconProps {
  iconName: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  'calendar-check': CalendarCheck,
  'users': Users,
  'bug': Bug,
  'lightbulb': Lightbulb,
  'book-open': BookOpen,
  'target': Target,
  'message-square': MessageSquare,
  'presentation-chart': Presentation,
  'briefcase': Briefcase,
  'shopping-cart': ShoppingCart,
  'map': Map,
  'palette': Palette,
};

const NoteTypeIcon: React.FC<NoteTypeIconProps> = ({ iconName, className = "h-4 w-4" }) => {
  const IconComponent = iconMap[iconName] || FileText;
  
  return <IconComponent className={className} />;
};

export default NoteTypeIcon;
