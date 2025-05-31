import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Page not found
        </h2>
        <p className="mt-4 text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;