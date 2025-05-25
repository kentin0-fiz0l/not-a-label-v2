import { WifiOff, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="text-center px-4 py-16 max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <WifiOff className="h-16 w-16 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          You're Offline
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          It looks like you've lost your internet connection. Don't worry, you can still access some features offline.
        </p>
        
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Button>
        </div>
        
        <div className="mt-12 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Tip:</strong> Any tracks you were uploading will automatically sync when you're back online.
          </p>
        </div>
      </div>
    </div>
  );
}