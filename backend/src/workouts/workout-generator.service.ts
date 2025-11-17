import { Injectable } from '@nestjs/common';

interface MemberProfile {
  fitnessLevel?: string;
  fitnessGoal?: string;
  workoutsPerWeek?: number;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface WorkoutDay {
  dayNumber: number;
  name: string;
  exercises: Exercise[];
  description: string;
}

@Injectable()
export class WorkoutGeneratorService {
  generateWorkoutPlan(profile: MemberProfile) {
    const { fitnessLevel = 'BEGINNER', fitnessGoal = 'GENERAL_FITNESS', workoutsPerWeek = 3 } = profile;

    const planName = this.getPlanName(fitnessLevel, fitnessGoal, workoutsPerWeek);
    const sessions = this.generateSessions(fitnessLevel, fitnessGoal, workoutsPerWeek);

    return {
      name: planName,
      description: `A ${workoutsPerWeek}-day per week ${fitnessLevel.toLowerCase()} program focused on ${fitnessGoal.toLowerCase().replace('_', ' ')}`,
      weeks: 4,
      sessions,
    };
  }

  private getPlanName(level: string, goal: string, days: number): string {
    const levelName = level.charAt(0) + level.slice(1).toLowerCase();
    return `${days}-Day ${levelName} ${goal.replace('_', ' ')} Program`;
  }

  private generateSessions(level: string, goal: string, days: number): WorkoutDay[] {
    if (days === 3) {
      return this.generate3DaySplit(level, goal);
    } else if (days === 4) {
      return this.generate4DaySplit(level, goal);
    } else if (days >= 5) {
      return this.generate5DaySplit(level, goal);
    }
    return this.generate3DaySplit(level, goal);
  }

  private generate3DaySplit(level: string, goal: string): WorkoutDay[] {
    const baseReps = this.getRepsForGoal(goal);
    const sets = level === 'BEGINNER' ? 3 : level === 'INTERMEDIATE' ? 4 : 5;

    return [
      {
        dayNumber: 1,
        name: 'Full Body A',
        description: 'Upper and lower body compound movements',
        exercises: [
          { name: 'Squats', sets, reps: baseReps, rest: '90-120s' },
          { name: 'Bench Press', sets, reps: baseReps, rest: '90-120s' },
          { name: 'Bent-Over Rows', sets, reps: baseReps, rest: '90s' },
          { name: 'Overhead Press', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Plank', sets: 3, reps: '30-60s', rest: '60s' },
        ],
      },
      {
        dayNumber: 2,
        name: 'Full Body B',
        description: 'Variation with different exercises',
        exercises: [
          { name: 'Deadlifts', sets, reps: baseReps, rest: '120s' },
          { name: 'Pull-Ups or Lat Pulldown', sets, reps: baseReps, rest: '90s' },
          { name: 'Incline Dumbbell Press', sets, reps: baseReps, rest: '90s' },
          { name: 'Lunges', sets: sets - 1, reps: '8-12 each leg', rest: '60s' },
          { name: 'Bicycle Crunches', sets: 3, reps: '15-20', rest: '45s' },
        ],
      },
      {
        dayNumber: 3,
        name: 'Full Body C',
        description: 'Mixed compound and isolation work',
        exercises: [
          { name: 'Front Squats', sets, reps: baseReps, rest: '90-120s' },
          { name: 'Dumbbell Bench Press', sets, reps: baseReps, rest: '90s' },
          { name: 'Cable Rows', sets, reps: baseReps, rest: '90s' },
          { name: 'Dumbbell Shoulder Press', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Russian Twists', sets: 3, reps: '20', rest: '45s' },
        ],
      },
    ];
  }

  private generate4DaySplit(level: string, goal: string): WorkoutDay[] {
    const baseReps = this.getRepsForGoal(goal);
    const sets = level === 'BEGINNER' ? 3 : level === 'INTERMEDIATE' ? 4 : 5;

    return [
      {
        dayNumber: 1,
        name: 'Upper Body Push',
        description: 'Chest, shoulders, and triceps',
        exercises: [
          { name: 'Bench Press', sets, reps: baseReps, rest: '90-120s' },
          { name: 'Overhead Press', sets, reps: baseReps, rest: '90s' },
          { name: 'Incline Dumbbell Press', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Tricep Dips', sets: 3, reps: '8-12', rest: '60s' },
        ],
      },
      {
        dayNumber: 2,
        name: 'Lower Body',
        description: 'Legs and glutes',
        exercises: [
          { name: 'Squats', sets, reps: baseReps, rest: '120s' },
          { name: 'Romanian Deadlifts', sets, reps: baseReps, rest: '90s' },
          { name: 'Leg Press', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Leg Curls', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        dayNumber: 3,
        name: 'Upper Body Pull',
        description: 'Back and biceps',
        exercises: [
          { name: 'Deadlifts', sets, reps: baseReps, rest: '120s' },
          { name: 'Pull-Ups', sets, reps: baseReps, rest: '90s' },
          { name: 'Barbell Rows', sets, reps: baseReps, rest: '90s' },
          { name: 'Face Pulls', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Bicep Curls', sets: 3, reps: '10-12', rest: '60s' },
        ],
      },
      {
        dayNumber: 4,
        name: 'Full Body / Core',
        description: 'Mixed movements and core work',
        exercises: [
          { name: 'Front Squats', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Dumbbell Bench Press', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Cable Rows', sets: sets - 1, reps: baseReps, rest: '90s' },
          { name: 'Plank', sets: 3, reps: '45-90s', rest: '60s' },
          { name: 'Russian Twists', sets: 3, reps: '20', rest: '45s' },
        ],
      },
    ];
  }

  private generate5DaySplit(level: string, goal: string): WorkoutDay[] {
    const baseReps = this.getRepsForGoal(goal);
    const sets = level === 'BEGINNER' ? 3 : level === 'INTERMEDIATE' ? 4 : 5;

    return [
      {
        dayNumber: 1,
        name: 'Chest',
        description: 'Chest focused day',
        exercises: [
          { name: 'Bench Press', sets, reps: baseReps, rest: '90-120s' },
          { name: 'Incline Dumbbell Press', sets, reps: baseReps, rest: '90s' },
          { name: 'Chest Flyes', sets: sets - 1, reps: '10-12', rest: '60s' },
          { name: 'Push-Ups', sets: 3, reps: 'to failure', rest: '60s' },
        ],
      },
      {
        dayNumber: 2,
        name: 'Back',
        description: 'Back focused day',
        exercises: [
          { name: 'Deadlifts', sets, reps: baseReps, rest: '120s' },
          { name: 'Pull-Ups', sets, reps: baseReps, rest: '90s' },
          { name: 'Barbell Rows', sets, reps: baseReps, rest: '90s' },
          { name: 'Lat Pulldown', sets: sets - 1, reps: '10-12', rest: '60s' },
        ],
      },
      {
        dayNumber: 3,
        name: 'Legs',
        description: 'Leg focused day',
        exercises: [
          { name: 'Squats', sets, reps: baseReps, rest: '120s' },
          { name: 'Leg Press', sets, reps: baseReps, rest: '90s' },
          { name: 'Romanian Deadlifts', sets, reps: baseReps, rest: '90s' },
          { name: 'Leg Curls', sets: 3, reps: '10-12', rest: '60s' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s' },
        ],
      },
      {
        dayNumber: 4,
        name: 'Shoulders',
        description: 'Shoulder focused day',
        exercises: [
          { name: 'Overhead Press', sets, reps: baseReps, rest: '90-120s' },
          { name: 'Lateral Raises', sets, reps: '12-15', rest: '60s' },
          { name: 'Front Raises', sets: sets - 1, reps: '12-15', rest: '60s' },
          { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '60s' },
        ],
      },
      {
        dayNumber: 5,
        name: 'Arms & Core',
        description: 'Arms and core focused day',
        exercises: [
          { name: 'Barbell Curls', sets, reps: '8-12', rest: '60s' },
          { name: 'Tricep Dips', sets, reps: '8-12', rest: '60s' },
          { name: 'Hammer Curls', sets: sets - 1, reps: '10-12', rest: '60s' },
          { name: 'Overhead Tricep Extension', sets: sets - 1, reps: '10-12', rest: '60s' },
          { name: 'Plank', sets: 3, reps: '60-90s', rest: '60s' },
          { name: 'Ab Wheel Rollouts', sets: 3, reps: '10-15', rest: '60s' },
        ],
      },
    ];
  }

  private getRepsForGoal(goal: string): string {
    switch (goal) {
      case 'STRENGTH':
        return '4-6';
      case 'MUSCLE_GAIN':
        return '8-12';
      case 'WEIGHT_LOSS':
      case 'ENDURANCE':
        return '12-15';
      case 'GENERAL_FITNESS':
      default:
        return '8-12';
    }
  }
}
