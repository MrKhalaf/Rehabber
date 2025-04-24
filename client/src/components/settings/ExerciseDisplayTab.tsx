import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExerciseDisplayTab = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Exercise Display</h3>
        <p className="text-sm text-muted-foreground">
          Configure how exercises are displayed and organized.
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="filter-category" className="text-base">Filter by Category</Label>
          <p className="text-sm text-muted-foreground">
            Show exercises from specific categories
          </p>
        </div>
        <Select 
          value={settings.filterCategory || 'all'}
          onValueChange={(value) => updateSettings({ 
            filterCategory: value === 'all' ? null : value 
          })}
        >
          <SelectTrigger id="filter-category" className="w-[160px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Core Stability">Core Stability</SelectItem>
            <SelectItem value="Lower Body">Lower Body</SelectItem>
            <SelectItem value="Upper Body">Upper Body</SelectItem>
            <SelectItem value="Mobility">Mobility</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Sort By */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="sort-by" className="text-base">Sort Exercises By</Label>
          <p className="text-sm text-muted-foreground">
            Order exercises based on criteria
          </p>
        </div>
        <Select 
          value={settings.sortBy}
          onValueChange={(value) => updateSettings({ 
            sortBy: value as 'alphabetical' | 'category' | 'lastCompleted'
          })}
        >
          <SelectTrigger id="sort-by" className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="lastCompleted">Recently Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Hide Completed */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="hide-completed" className="text-base">Hide Completed Exercises</Label>
          <p className="text-sm text-muted-foreground">
            Only show exercises you haven't completed today
          </p>
        </div>
        <Switch 
          id="hide-completed"
          checked={settings.hideCompleted}
          onCheckedChange={(checked) => updateSettings({ hideCompleted: checked })}
        />
      </div>
    </div>
  );
};

export default ExerciseDisplayTab;