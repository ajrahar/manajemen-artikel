'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category { id: string; name: string; }
interface CategoryFilterProps {
  categories: Category[];
  // Callback function untuk mengirim ID kategori yang dipilih
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({ categories, onSelectCategory }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  const handleSelect = (category: Category | null) => {
    setSelectedCategory(category ? category.name : 'All Categories');
    onSelectCategory(category ? category.id : null); // Kirim ID atau null
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 sm:flex-none justify-between text-left text-gray-500 bg-gray-100 hover:bg-gray-200 w-full sm:w-48"
        >
          {selectedCategory}
          <ChevronDown size={20} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onSelect={() => handleSelect(null)}>
          All Categories
        </DropdownMenuItem>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onSelect={() => handleSelect(category)}
          >
            {category.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
