import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Award, Target, Edit2, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  threshold?: number;
}

export default function GamificationSettings() {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newAchievement, setNewAchievement] = React.useState({
    name: '',
    description: '',
    icon: 'trophy',
    points: 0,
    threshold: 0
  });
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateAchievementMutation = useMutation({
    mutationFn: async (achievement: Achievement) => {
      const { error } = await supabase
        .from('achievements')
        .update(achievement)
        .eq('id', achievement.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['achievements']);
      setEditingId(null);
      toast.success('Achievement updated successfully');
    }
  });

  const addAchievementMutation = useMutation({
    mutationFn: async (achievement: Omit<Achievement, 'id'>) => {
      const { error } = await supabase
        .from('achievements')
        .insert([achievement]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['achievements']);
      setIsAdding(false);
      setNewAchievement({
        name: '',
        description: '',
        icon: 'trophy',
        points: 0,
        threshold: 0
      });
      toast.success('Achievement added successfully');
    }
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['achievements']);
      toast.success('Achievement deleted successfully');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gamification Settings</h1>
          <p className="text-muted-foreground">Manage achievements, points, and rewards</p>
        </div>
        <Trophy className="w-8 h-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements List */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Achievements</h3>
                </div>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center px-3 py-1.5 text-sm text-primary hover:text-primary/90 bg-primary/10 rounded-md"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Achievement
                </button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {isAdding && (
                <div className="p-4 bg-muted/50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={newAchievement.name}
                        onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                      <input
                        type="text"
                        value={newAchievement.description}
                        onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Icon</label>
                        <select
                          value={newAchievement.icon}
                          onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                        >
                          <option value="trophy">Trophy</option>
                          <option value="award">Award</option>
                          <option value="star">Star</option>
                          <option value="target">Target</option>
                          <option value="zap">Lightning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Points</label>
                        <input
                          type="number"
                          value={newAchievement.points}
                          onChange={(e) => setNewAchievement({ ...newAchievement, points: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Threshold</label>
                        <input
                          type="number"
                          value={newAchievement.threshold}
                          onChange={(e) => setNewAchievement({ ...newAchievement, threshold: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => addAchievementMutation.mutate(newAchievement)}
                        disabled={!newAchievement.name || !newAchievement.description}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        Add Achievement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {achievements.map((achievement) => (
                <div key={achievement.id} className="p-4">
                  {editingId === achievement.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                          <input
                            type="text"
                            value={achievement.name}
                            onChange={(e) => {
                              const updated = { ...achievement, name: e.target.value };
                              updateAchievementMutation.mutate(updated);
                            }}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Points</label>
                          <input
                            type="number"
                            value={achievement.points}
                            onChange={(e) => {
                              const updated = { ...achievement, points: parseInt(e.target.value) };
                              updateAchievementMutation.mutate(updated);
                            }}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <input
                          type="text"
                          value={achievement.description}
                          onChange={(e) => {
                            const updated = { ...achievement, description: e.target.value };
                            updateAchievementMutation.mutate(updated);
                          }}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center px-3 py-1.5 text-sm text-primary hover:text-primary/90 bg-primary/10 rounded-md"
                        >
                          <Save className="w-4 h-4 mr-1.5" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{achievement.name}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          <div className="text-sm text-primary mt-1">
                            {achievement.points} points
                            {achievement.threshold && ` • Requires ${achievement.threshold} actions`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingId(achievement.id)}
                          className="p-2 text-muted-foreground hover:text-primary rounded-md"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this achievement?')) {
                              deleteAchievementMutation.mutate(achievement.id);
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats & Settings */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">Point System</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Points per Call
                </label>
                <input
                  type="number"
                  defaultValue={10}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Points per Payment
                </label>
                <input
                  type="number"
                  defaultValue={25}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Points per Resolution
                </label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                />
              </div>
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Save Point Values
              </button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium">Leaderboard Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Reset Interval
                </label>
                <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Top Performers Count
                </label>
                <input
                  type="number"
                  defaultValue={10}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                />
              </div>
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}