# 📋 IMPLEMENTATION TEMPLATES & QUICK START

Use these production-ready templates as the baseline for building out platform features. This ensures consistency and standardizes error handling, state management, and API design.

---

## 1. Backend: Express Controller Template
*Standardized payload wrapping, try/catch async handling, and dependency injection patterns.*

```typescript
// src/controllers/module.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ModuleService } from '../services/module.service';
import { AppError } from '../utils/AppError';

export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  /**
   * Retrieves all active learning modules
   */
  public getModules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const modules = await this.moduleService.findAll({ page, limit });

      res.status(200).json({
        status: 'success',
        results: modules.length,
        data: { modules }
      });
    } catch (err) {
      next(err); // Passes to global error handling middleware
    }
  };

  /**
   * Complete a module for the authed user
   */
  public completeModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { moduleId } = req.params;
      const userId = req.user!.id; // Assumes AuthMiddleware set req.user

      const progress = await this.moduleService.markAsComplete(userId, moduleId);

      res.status(200).json({
        status: 'success',
        data: { progress }
      });
    } catch (err) {
      next(new AppError('Failed to complete module', 400));
    }
  };
}
```

---

## 2. Frontend: Data Fetching Hook (TanStack Query)
*Consistent caching, loading, and error states for HTTP requests.*

```tsx
// src/hooks/useModules.ts
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { Module } from '../types';

interface FetchModulesResponse {
  status: string;
  data: { modules: Module[] };
}

const fetchModules = async (): Promise<Module[]> => {
  const { data } = await axiosInstance.get<FetchModulesResponse>('/api/v1/modules');
  return data.data.modules;
};

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: fetchModules,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
};
```

---

## 3. Frontend: Protected Component Template (React + Tailwind)
*Combines data loading, loading skeletons, and Tailwind responsive styling.*

```tsx
// src/components/ModuleList.tsx
import React from 'react';
import { useModules } from '../hooks/useModules';
import { ModuleCard } from './ModuleCard';
import { LoadingSkeleton } from './ui/LoadingSkeleton';

export const ModuleList: React.FC = () => {
  const { data: modules, isLoading, isError, error } = useModules();

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <div className="text-red-500 bg-red-50 p-4 rounded-md">Error: {(error as Error).message}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Learning Journey</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules?.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
        {modules?.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No modules assigned yet.
          </p>
        )}
      </div>
    </div>
  );
};
```

---

## 4. Backend: PostgreSQL Migration Template (Raw SQL Example)
*Safe upward and downward migrations referencing indexes.*

```sql
-- migration-002-create-modules.sql
-- UP
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_order ON modules(order_index);

-- DOWN
DROP INDEX IF EXISTS idx_modules_order;
DROP TABLE IF EXISTS modules;
```

*Use these templates to avoid "re-inventing the wheel" for common CRUD/UI operations.*
