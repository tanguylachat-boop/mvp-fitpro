'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FitnessLevel, FitnessGoal } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    fitnessLevel: '' as FitnessLevel | '',
    fitnessGoal: '' as FitnessGoal | '',
    workoutsPerWeek: '3',
    medicalNotes: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'MEMBER') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.patch('/members/profile', {
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        fitnessLevel: formData.fitnessLevel || undefined,
        fitnessGoal: formData.fitnessGoal || undefined,
        workoutsPerWeek: parseInt(formData.workoutsPerWeek),
        medicalNotes: formData.medicalNotes || undefined,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to get personalized workout recommendations
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Physical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="170"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="30"
                  max="300"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="70"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="25"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Fitness Level */}
            <div className="space-y-2">
              <Label htmlFor="fitnessLevel">Fitness Level</Label>
              <Select
                value={formData.fitnessLevel}
                onValueChange={(value) => handleChange('fitnessLevel', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner - New to exercise</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate - Regular exerciser</SelectItem>
                  <SelectItem value="ADVANCED">Advanced - Athletic background</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fitness Goal */}
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal">Primary Goal</Label>
              <Select
                value={formData.fitnessGoal}
                onValueChange={(value) => handleChange('fitnessGoal', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                  <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                  <SelectItem value="STRENGTH">Build Strength</SelectItem>
                  <SelectItem value="ENDURANCE">Improve Endurance</SelectItem>
                  <SelectItem value="GENERAL_FITNESS">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workouts Per Week */}
            <div className="space-y-2">
              <Label htmlFor="workoutsPerWeek">Workouts Per Week</Label>
              <Select
                value={formData.workoutsPerWeek}
                onValueChange={(value) => handleChange('workoutsPerWeek', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'day' : 'days'} per week
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medical Notes */}
            <div className="space-y-2">
              <Label htmlFor="medicalNotes">Medical Notes (Optional)</Label>
              <Input
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) => handleChange('medicalNotes', e.target.value)}
                placeholder="Any injuries or conditions we should know about?"
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
