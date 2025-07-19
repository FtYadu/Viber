export interface CSVImageData {
  filename: string;
  imageurl: string;
  caption: string;
}

export function parseCSVData(csvContent: string): CSVImageData[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        filename: values[0] || '',
        imageurl: values[1] || '',
        caption: values[2] || ''
      };
    })
    .filter(item => item.imageurl && item.filename);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomImages(images: CSVImageData[], count: number): CSVImageData[] {
  const shuffled = shuffleArray(images);
  return shuffled.slice(0, count);
}
