export interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: number;
}

// Type guard for API response validation
export function isValidPoem(obj: any): obj is Poem {
  return (
    obj &&
    typeof obj.title === 'string' && obj.title.trim() !== '' &&
    typeof obj.author === 'string' && obj.author.trim() !== '' &&
    Array.isArray(obj.lines) &&
    typeof obj.linecount === 'number'
  );
}
