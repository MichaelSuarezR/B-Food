import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  raised: number;
  goal: number;
  status: 'active' | 'ending-soon' | 'completed' | 'cancelled';
  category: string;
}

export function ProjectCard({ 
  title, 
  description, 
  progress, 
  raised, 
  goal, 
  status, 
  category 
}: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ending-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.replace('-', ' ')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold">${raised.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-1">
                raised of ${goal.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Category: {category}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full">
          View Project
        </Button>
      </CardFooter>
    </Card>
  );
}
